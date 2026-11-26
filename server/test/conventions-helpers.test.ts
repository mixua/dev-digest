import { describe, it, expect } from 'vitest';
import { normalize, locateSnippet, dedupKey, buildSkillBody } from '../src/modules/conventions/helpers.js';

describe('conventions helpers', () => {
  it('normalize collapses whitespace', () => {
    expect(normalize('  a \n\t b  ')).toBe('a b');
  });

  it('locateSnippet finds lines ignoring whitespace, null when absent', () => {
    const c = 'one\nconst a =\n    1;\nthree\n';
    expect(locateSnippet(c, 'const a = 1;')).toEqual({ lineStart: 2, lineEnd: 3 });
    expect(locateSnippet(c, 'three')).toEqual({ lineStart: 4, lineEnd: 4 });
    expect(locateSnippet(c, 'nope')).toBeNull();
    expect(locateSnippet(c, '   ')).toBeNull();
  });

  it('dedupKey ignores case/whitespace in rule, keeps path', () => {
    expect(dedupKey('Use  X', 'a.ts')).toBe(dedupKey('use x', 'a.ts'));
    expect(dedupKey('use x', 'a.ts')).not.toBe(dedupKey('use x', 'b.ts'));
  });

  it('buildSkillBody groups by category and renders evidence', () => {
    const body = buildSkillBody([
      { rule: 'R1', category: 'naming', evidencePath: 'src/a.ts', evidenceSnippet: 'x', lineStart: 1, lineEnd: 2 },
      { rule: 'R2', category: null, evidencePath: null, evidenceSnippet: null, lineStart: null, lineEnd: null },
    ]);
    expect(body).toContain('# repo-conventions');
    expect(body).toContain('## naming\nR1\nDetected in `src/a.ts:1-2`.\n```ts\nx\n```');
    expect(body).toContain('## general\nR2');
  });
});
