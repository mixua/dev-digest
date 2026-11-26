import type { Skill, SkillVersion } from '@devdigest/shared';
import type { SkillRow, SkillVersionRow } from '../../db/rows.js';

/**
 * Pure helpers for the skills module — DB row ⇄ DTO mapping. No I/O.
 */

/** Map a persisted skill row to the public `Skill` DTO. */
export function toSkillDto(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type as Skill['type'],
    source: row.source as Skill['source'],
    body: row.body,
    enabled: row.enabled,
    version: row.version,
    evidence_files: row.evidenceFiles ?? null,
  };
}

const SKILL_TYPES = ['rubric', 'convention', 'security', 'custom'] as const;
type ImportedSkillType = (typeof SKILL_TYPES)[number];

/** Imported markdown → skill fields: YAML frontmatter (name/description/type) wins, body without it. */
export function skillFromMarkdown(
  text: string,
  fallbackName: string,
): { name: string; description: string; type: ImportedSkillType; body: string } {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  const meta: Record<string, string> = {};
  for (const line of fm ? fm[1]!.split(/\r?\n/) : []) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]!] = kv[2]!.trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  const body = fm ? text.slice(fm[0].length).replace(/^\s+/, '') : text;
  const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim();
  const type = (SKILL_TYPES as readonly string[]).includes(meta.type ?? '')
    ? (meta.type as ImportedSkillType)
    : 'custom';
  return { name: meta.name || title || fallbackName, description: meta.description ?? '', type, body };
}

/** Map a persisted skill_versions row to the public `SkillVersion` DTO. */
export function toSkillVersionDto(row: SkillVersionRow): SkillVersion {
  return {
    skill_id: row.skillId,
    version: row.version,
    body: row.body,
    message: row.message ?? null,
    created_at: row.createdAt.toISOString(),
  };
}
