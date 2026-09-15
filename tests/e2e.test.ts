import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { analyzeRoster } from '../src/analyzer.js';

describe('End-to-End TerraGrid Roster Analysis', () => {
  const rosterPath = path.resolve(process.cwd(), 'data', 'Network Roster Terragrid.xlsx');

  it('correctly loads and processes the 25-contact TerraGrid roster', () => {
    const result = analyzeRoster(rosterPath);

    expect(result.totalContacts).toBe(25);
    expect(result.topWeeklyFocus.length).toBeGreaterThanOrEqual(3);
    expect(result.topWeeklyFocus.length).toBeLessThanOrEqual(5);
    expect(result.dormantHighLeverage.length).toBeGreaterThanOrEqual(2);
    expect(result.dormantHighLeverage.length).toBeLessThanOrEqual(3);
  });

  it('selects high-leverage actionable candidates for top weekly focus', () => {
    const result = analyzeRoster(rosterPath);
    const topNames = result.topWeeklyFocus.map(item => item.contact.name);

    // Marcus Wei (Sequoia, asked for full pitch)
    expect(topNames).toContain('Marcus Wei');
    // Diana Chen (Stripe CTO, offered 3-4 candidate intros)
    expect(topNames).toContain('Diana Chen');
    // Maya Patel (Slack VP Eng, 1-month follow up window)
    expect(topNames).toContain('Maya Patel');
    // Paul Christiano (ARC Evals, interested in evaluation collaboration)
    expect(topNames).toContain('Paul Christiano');

    // Verify personal friend James Park is NOT in top business focus
    expect(topNames).not.toContain('James Park');
    // Verify cold aspirational Jensen Huang is NOT in top focus
    expect(topNames).not.toContain('Jensen Huang');
  });

  it('correctly identifies Reid Hoffman in dormant high-leverage relationships', () => {
    const result = analyzeRoster(rosterPath);
    const dormantNames = result.dormantHighLeverage.map(item => item.contact.name);

    expect(dormantNames).toContain('Reid Hoffman');
    const reid = result.dormantHighLeverage.find(i => i.contact.name === 'Reid Hoffman');
    expect(reid?.contact.daysSinceLastContact).toBe(81);
    expect(reid?.contact.relationshipStrength).toBe(4);
  });

  it('detects missing goal targets, ambiguous names, thin context, and stale records', () => {
    const result = analyzeRoster(rosterPath);

    // Missing entities
    const missingEntities = result.qualityFlags.missingGoalContacts.map(m => m.missingEntity);
    expect(missingEntities).toContain('a16z');
    expect(missingEntities).toContain('MIRI');

    // Ambiguous names
    expect(result.qualityFlags.ambiguousNames.some(a => a.details.includes('David'))).toBe(true);

    // Thin context
    const thinNames = result.qualityFlags.thinContextContacts.map(t => t.name);
    expect(thinNames).toContain('Anjali Sharma');

    // Stale contacts
    const staleNames = result.qualityFlags.staleContacts.map(s => s.name);
    expect(staleNames).toContain('Jensen Huang');
    expect(staleNames).toContain('Priya Mehta');
  });
});
