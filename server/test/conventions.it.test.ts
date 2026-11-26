import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startPg, dockerAvailable, type PgFixture } from './helpers/pg.js';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/platform/config.js';
import { seed } from '../src/db/seed.js';
import * as t from '../src/db/schema.js';
import { MockLLMProvider } from '../src/adapters/mocks.js';
import type { RepoIntel } from '../src/modules/repo-intel/types.js';

const d = (await dockerAvailable()) ? describe : describe.skip;
const config = loadConfig({ ...process.env, NODE_ENV: 'test' } as NodeJS.ProcessEnv);

const A = 'export function a() {\n  return 1;\n}\n';
const good = {
  rule: 'Use named exports',
  category: 'structure',
  evidence_path: 'src/a.ts',
  evidence_snippet: 'export function a() {',
  confidence: 0.9,
};

d('conventions extractor (Testcontainers pg)', () => {
  let pg: PgFixture;
  let dir: string;
  let repoId: string;

  beforeAll(async () => {
    pg = await startPg();
    await seed(pg.handle.db);
    dir = mkdtempSync(join(tmpdir(), 'conv-'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src/a.ts'), A);
    const [ws] = await pg.handle.db.select().from(t.workspaces);
    const [repo] = await pg.handle.db
      .insert(t.repos)
      .values({ workspaceId: ws!.id, owner: 'acme', name: 'x', fullName: 'acme/x', clonePath: dir })
      .returning();
    repoId = repo!.id;
  });
  afterAll(async () => {
    await pg?.stop();
    rmSync(dir, { recursive: true, force: true });
  });

  async function appWith(conventions: unknown[]) {
    const llm = new MockLLMProvider('openai', {
      structuredBySchema: { conventions_extract: { conventions } },
    });
    const repoIntel = { getConventionSamples: async () => ['src/a.ts'] } as unknown as RepoIntel;
    const app = await buildApp({
      config,
      db: pg.handle.db,
      overrides: { llm: { openai: llm, openrouter: llm, anthropic: llm }, repoIntel },
    });
    return { app, llm };
  }
  const extract = (app: Awaited<ReturnType<typeof appWith>>['app']) =>
    app.inject({ method: 'POST', url: `/repos/${repoId}/conventions/extract` });

  it('success run: one model call, lines computed, bad evidence dropped', async () => {
    const { app, llm } = await appWith([
      good,
      { ...good, rule: 'No evidence', evidence_snippet: 'does not exist in file' },
      { ...good, rule: 'Ghost file', evidence_path: 'src/ghost.ts' },
    ]);
    const res = await extract(app);
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(llm.calls.filter((c) => c.method === 'completeStructured')).toHaveLength(1);
    expect(body.candidates).toHaveLength(1);
    expect(body.candidates[0]).toMatchObject({
      rule: 'Use named exports',
      status: 'pending',
      accepted: false,
      evidence_line_start: 1,
      evidence_line_end: 1,
    });
    expect(body.meta).toMatchObject({ sample_files: 1, repo_full_name: 'acme/x', default_branch: 'main' });
    expect(body.meta.last_scan_at).toBeTruthy();
    await app.close();
  });

  it('re-scan dedups decided rows; skill draft only from accepted', async () => {
    const { app } = await appWith([good, { ...good, rule: 'Another rule' }, { ...good, rule: 'Third rule' }]);
    let list = (await extract(app)).json().candidates as { id: string; rule: string; status: string }[];
    const byRule = (r: string) => list.find((c) => c.rule === r)!;
    await app.inject({ method: 'PATCH', url: `/conventions/${byRule('Use named exports').id}`, payload: { status: 'accepted' } });
    await app.inject({ method: 'PATCH', url: `/conventions/${byRule('Another rule').id}`, payload: { status: 'rejected' } });
    const third = byRule('Third rule').id;

    list = (await extract(app)).json().candidates;
    expect(list.map((c) => c.rule).sort()).toEqual(['Another rule', 'Third rule', 'Use named exports']);
    expect(list.find((c) => c.rule === 'Use named exports')!.status).toBe('accepted');
    expect(list.find((c) => c.rule === 'Another rule')!.status).toBe('rejected');
    expect(list.filter((c) => c.status === 'pending')).toHaveLength(1);

    const draft = (await app.inject({ method: 'GET', url: `/repos/${repoId}/conventions/skill-draft` })).json();
    expect(draft.accepted_count).toBe(1);
    expect(draft.name).toBe('repo-conventions');
    expect(draft.body).toContain('Use named exports');
    expect(draft.body).not.toContain('Another rule');
    expect(draft.body).not.toContain('Third rule');

    const edited = await app.inject({ method: 'PATCH', url: `/conventions/${third}`, payload: { rule: 'Edited' } });
    expect(edited.statusCode).toBe(404); // pending row was replaced by the re-scan
    const now = list.find((c) => c.rule === 'Third rule')!.id;
    const ok = await app.inject({ method: 'PATCH', url: `/conventions/${now}`, payload: { rule: 'Edited' } });
    expect(ok.json().rule).toBe('Edited');
    await app.close();
  });
});
