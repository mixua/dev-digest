import { describe, it, expect } from 'vitest';
import { skillFromMarkdown } from '../src/modules/skills/helpers.js';

describe('skillFromMarkdown', () => {
  it('reads name/description/type from frontmatter and strips it from the body', () => {
    const md = '---\nname: deprecation-policy\ndescription: "Use when a PR removes a route"\ntype: security\n---\n\n# deprecation-policy\nrules';
    expect(skillFromMarkdown(md, 'file')).toEqual({
      name: 'deprecation-policy',
      description: 'Use when a PR removes a route',
      type: 'security',
      body: '# deprecation-policy\nrules',
    });
  });

  it('falls back to the # heading, then the filename; unknown type → custom', () => {
    expect(skillFromMarkdown('# my-skill\nx', 'f')).toMatchObject({ name: 'my-skill', type: 'custom', description: '' });
    expect(skillFromMarkdown('no heading', 'stem')).toMatchObject({ name: 'stem' });
    expect(skillFromMarkdown('---\ntype: weird\n---\nx', 'f').type).toBe('custom');
  });
});
