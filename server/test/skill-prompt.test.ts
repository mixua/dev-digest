import { describe, it, expect } from 'vitest';
import { formatSkillForPrompt } from '../src/modules/reviews/helpers.js';

describe('formatSkillForPrompt', () => {
  it('prefixes the skill heading with name and type', () => {
    const out = formatSkillForPrompt({ name: 'repo-conventions', type: 'convention', source: 'extracted', body: '# rules' });
    expect(out).toBe('### Skill: repo-conventions (convention)\n# rules');
  });

  it('wraps imported skills in untrusted delimiters', () => {
    const out = formatSkillForPrompt({ name: 'deprecation-policy', type: 'security', source: 'imported_url', body: 'x' });
    expect(out.startsWith('### Skill: deprecation-policy (security)\n<untrusted source="skill:deprecation-policy">')).toBe(true);
    expect(out.trimEnd().endsWith('</untrusted>')).toBe(true);
  });
});
