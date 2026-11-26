/** PR-list findings rollup (`modules/pulls/findings.ts`): latest run per agent, summed. */
import { describe, it, expect } from 'vitest';
import { latestReviewIdsPerAgent, sumSeverity, sumCost } from '../src/modules/pulls/findings.js';

describe('latestReviewIdsPerAgent', () => {
  it('keeps only the newest review of each agent per PR', () => {
    const rows = [
      { id: 'r4', prId: 'p1', agentId: 'b' },
      { id: 'r3', prId: 'p1', agentId: 'a' },
      { id: 'r2', prId: 'p1', agentId: 'b' },
      { id: 'r1', prId: 'p1', agentId: 'a' },
      { id: 'r5', prId: 'p2', agentId: null },
      { id: 'r0', prId: 'p2', agentId: null },
    ];
    const m = latestReviewIdsPerAgent(rows);
    expect(m.get('p1')).toEqual(['r4', 'r3']);
    expect(m.get('p2')).toEqual(['r5']);
    expect(m.has('p3')).toBe(false);
  });
});

describe('sumSeverity', () => {
  it('sums counts across reviews and ignores reviews without findings', () => {
    const counts = new Map([
      ['r4', { critical: 1, warning: 2, suggestion: 0 }],
      ['r3', { critical: 0, warning: 1, suggestion: 4 }],
    ]);
    expect(sumSeverity(['r4', 'r3', 'r9'], counts)).toEqual({ critical: 1, warning: 3, suggestion: 4 });
  });
});

describe('sumCost', () => {
  it('sums known costs, skipping null/missing', () => {
    const m = new Map<string, number | null>([['a', 0.01], ['b', null], ['c', 0.02]]);
    expect(sumCost(['a', 'b', 'c', 'x'], m)).toBeCloseTo(0.03);
  });
  it('is null when no run has a cost', () => {
    expect(sumCost(['a', 'x'], new Map([['a', null]]))).toBeNull();
    expect(sumCost([], new Map())).toBeNull();
  });
  it('keeps a genuine zero cost', () => {
    expect(sumCost(['a'], new Map([['a', 0]]))).toBe(0);
  });
});
