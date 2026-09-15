import { describe, it, expect } from 'vitest';
import { calculateScores } from '../src/scoring.js';
import { Contact } from '../src/types.js';

describe('Dormancy & Leverage Detection', () => {
  it('identifies high-leverage dormant relationships (>= 60 days with high strategic value)', () => {
    const reidLikeContact: Contact = {
      name: 'Reid Test',
      role: 'Partner',
      company: 'Greylock',
      howSheKnowsThem: 'investor',
      daysSinceLastContact: 81,
      lastContactChannel: 'event',
      lastContactSummary: 'Saw him at CES. Brief catch-up, wanted to hear Series C plans.',
      relationshipStrength: 4,
      tags: ['investor', 'dormant', 'series-c'],
      notes: 'Strongest investor relationship. Pre-seed investor. Key signal for round.',
      rawRow: 6
    };

    const scoring = calculateScores(reidLikeContact);
    expect(scoring.isDormantHighLeverage).toBe(true);
    expect(scoring.dormancyReasons.length).toBeGreaterThan(0);
    expect(scoring.dormancyReasons.some(r => r.includes('81 days'))).toBe(true);
  });

  it('filters out cold aspirational contacts from dormant high-leverage classification', () => {
    const aspirationalContact: Contact = {
      name: 'Aspirational CEO',
      role: 'CEO',
      company: 'Tech Giant',
      howSheKnowsThem: 'event',
      daysSinceLastContact: 199,
      lastContactChannel: 'event',
      lastContactSummary: 'Met briefly at conference. Shook hands. No substantive exchange.',
      relationshipStrength: 1,
      tags: ['aspirational', 'dormant-cold'],
      notes: 'No real relationship. Would be a stretch to reach out cold.',
      rawRow: 11
    };

    const scoring = calculateScores(aspirationalContact);
    expect(scoring.isDormantHighLeverage).toBe(false);
  });

  it('filters out disengaged intro contacts from dormant high-leverage classification', () => {
    const disengagedContact: Contact = {
      name: 'Disengaged Leader',
      role: 'CEO',
      company: 'Lab',
      howSheKnowsThem: 'intro',
      daysSinceLastContact: 103,
      lastContactChannel: 'email',
      lastContactSummary: 'Polite reply to intro email. No engagement since.',
      relationshipStrength: 2,
      tags: ['ai-safety', 'dormant'],
      notes: 'Polite but not engaged. Probably not the right thread to pull on right now.',
      rawRow: 22
    };

    const scoring = calculateScores(disengagedContact);
    expect(scoring.isDormantHighLeverage).toBe(false);
  });

  it('does not classify recently contacted high-leverage people as dormant', () => {
    const activeContact: Contact = {
      name: 'Active Partner',
      role: 'Partner',
      company: 'Sequoia Capital',
      howSheKnowsThem: 'investor',
      daysSinceLastContact: 16,
      lastContactChannel: 'email',
      lastContactSummary: 'Warm email exchange after teaser deck. Asked for full pitch.',
      relationshipStrength: 3,
      tags: ['investor', 'series-c', 'warm'],
      notes: 'Open to Q3 chat.',
      rawRow: 2
    };

    const scoring = calculateScores(activeContact);
    expect(scoring.isDormantHighLeverage).toBe(false);
  });
});
