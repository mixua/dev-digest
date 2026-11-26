/** Pure helpers for the conventions extractor (no I/O). */

export interface SkillDraftItem {
  rule: string;
  category: string | null;
  evidencePath: string | null;
  evidenceSnippet: string | null;
  lineStart: number | null;
  lineEnd: number | null;
}

/** Collapse all whitespace runs to one space and trim. */
export function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Dedup key for a candidate: normalised rule + evidence path. */
export function dedupKey(rule: string, evidencePath: string | null | undefined): string {
  return `${normalize(rule).toLowerCase()}::${evidencePath ?? ''}`;
}

/**
 * Find `snippet` in `content` ignoring whitespace differences; returns the
 * 1-based inclusive line range, or null when absent.
 */
export function locateSnippet(
  content: string,
  snippet: string,
): { lineStart: number; lineEnd: number } | null {
  const needle = normalize(snippet);
  if (!needle) return null;
  // Normalised text plus each char's offset in the original.
  let norm = '';
  const map: number[] = [];
  let prevSpace = true;
  for (let i = 0; i < content.length; i++) {
    const ws = /\s/.test(content[i]!);
    if (ws) {
      if (prevSpace) continue;
      norm += ' ';
    } else {
      norm += content[i];
    }
    map.push(i);
    prevSpace = ws;
  }
  const at = norm.indexOf(needle);
  if (at < 0) return null;
  const startOff = map[at]!;
  const endOff = map[at + needle.length - 1]!;
  const lineOf = (off: number) => content.slice(0, off).split('\n').length;
  return { lineStart: lineOf(startOff), lineEnd: lineOf(endOff) };
}

const LANG: Record<string, string> = {
  ts: 'ts', tsx: 'tsx', js: 'js', jsx: 'jsx', mjs: 'js', cjs: 'js', json: 'json',
  py: 'py', go: 'go', rs: 'rs', rb: 'rb', java: 'java', yml: 'yaml', yaml: 'yaml', md: 'md',
};

/** Skill body from ACCEPTED conventions only (caller filters), grouped by category. */
export function buildSkillBody(items: SkillDraftItem[]): string {
  const groups = new Map<string, SkillDraftItem[]>();
  for (const it of items) {
    const k = it.category?.trim() || 'general';
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  const out = [
    '# repo-conventions',
    '',
    'House conventions detected in this repo. Flag changes that violate any rule below and cite the offending `file:line`.',
  ];
  for (const [cat, list] of groups) {
    out.push('', `## ${cat}`);
    for (const it of list) {
      out.push(it.rule);
      if (it.evidencePath) {
        const range =
          it.lineStart != null && it.lineEnd != null ? `:${it.lineStart}-${it.lineEnd}` : '';
        out.push(`Detected in \`${it.evidencePath}${range}\`.`);
        if (it.evidenceSnippet) {
          const lang = LANG[it.evidencePath.split('.').pop()?.toLowerCase() ?? ''] ?? '';
          out.push('```' + lang, it.evidenceSnippet, '```');
        }
      }
      out.push('');
    }
  }
  return out.join('\n').trimEnd() + '\n';
}
