import { describe, it, expect } from 'vitest';
import { matchGoals, calculateScores } from '../src/scoring.js';
import { Contact } from '../src/types.js';

describe('Deterministic Scoring Engine', () => {
  const baseContact: Contact = {
    name: 'Test Contact',
    role: 'Partner',
    company: 'Sequoia Capital',
    howSheKnowsThem: 'investor',
    daysSinceLastContact: 14,
    lastContactChannel: 'email',
    lastContactSummary: 'Positive reply to teaser deck, requested full pitch.',
    relationshipStrength: 4,
    tags: ['investor', 'series-c', 'warm'],
    notes: 'Series C investor target.',
    rawRow: 2
  };

  it('matches Series C goal accurately based on tags, company, and role', () => {
    const matches = matchGoals(baseContact);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].goalId).toBe('series_c');
    expect(matches[0].relevanceScore).toBeGreaterThanOrEqual(70);
  });

  it('matches CTO hire goal accurately for engineering leadership contacts', () => {
    const ctoContact: Contact = {
      name: 'Diana Candidate',
      role: 'VP Engineering',
      company: 'Slack',
      howSheKnowsThem: 'mentor',
      daysSinceLastContact: 20,
      lastContactChannel: 'call',
      lastContactSummary: 'Discussed CTO role, scaled team 40 to 200.',
      relationshipStrength: 4,
      tags: ['cto-candidate', 'cto-search'],
      notes: 'Strong candidate for CTO.',
      rawRow: 3
    };

    const matches = matchGoals(ctoContact);
    expect(matches.some(m => m.goalId === 'cto_hire')).toBe(true);
    const score = calculateScores(ctoContact);
    expect(score.compositeScore).toBeGreaterThan(80);
  });

  it('matches AI Safety goal accurately for researchers and safety institutes', () => {
    const safetyContact: Contact = {
      name: 'Dr. Safety',
      role: 'Researcher',
      company: 'Anthropic',
      howSheKnowsThem: 'intro',
      daysSinceLastContact: 10,
      lastContactChannel: 'email',
      lastContactSummary: 'Discussed alignment research and evaluation paper.',
      relationshipStrength: 3,
      tags: ['ai-safety', 'researcher'],
      notes: 'Interested in evaluation collaboration.',
      rawRow: 4
    };

    const matches = matchGoals(safetyContact);
    expect(matches.some(m => m.goalId === 'ai_safety')).toBe(true);
    const score = calculateScores(safetyContact);
    expect(score.compositeScore).toBeGreaterThan(70);
  });

  it('assigns composite score of 0 to personal contacts with no strategic goal alignment', () => {
    const personalContact: Contact = {
      name: 'Dr. Personal Friend',
      role: 'Physician',
      company: 'Hospital',
      howSheKnowsThem: 'personal',
      daysSinceLastContact: 2,
      lastContactChannel: 'call',
      lastContactSummary: 'Weekend catch-up call about kids.',
      relationshipStrength: 5,
      tags: ['personal', 'friend'],
      notes: 'Best friend since college. No business overlap.',
      rawRow: 5
    };

    const score = calculateScores(personalContact);
    expect(score.goalAlignmentScore).toBe(0);
    expect(score.compositeScore).toBe(0);
  });

  it('prioritizes high-intent actionable contacts over low-engagement ones', () => {
    const highIntent: Contact = {
      ...baseContact,
      name: 'High Intent',
      lastContactSummary: 'Asked to see the full pitch deck immediately.'
    };

    const lowEngagement: Contact = {
      ...baseContact,
      name: 'Low Engagement',
      tags: ['investor', 'lukewarm'],
      notes: 'Slow to engage, lukewarm reply.'
    };

    const scoreHigh = calculateScores(highIntent);
    const scoreLow = calculateScores(lowEngagement);

    expect(scoreHigh.compositeScore).toBeGreaterThan(scoreLow.compositeScore);
  });

  it('dynamically generates recommendations for unknown contact (Jane Doe) based on attributes', () => {
    const unknownInvestor: Contact = {
      name: 'Jane Doe',
      role: 'General Partner',
      company: 'Benchmark',
      howSheKnowsThem: 'investor',
      daysSinceLastContact: 12,
      lastContactChannel: 'email',
      lastContactSummary: 'Replied positively to teaser deck; asked to see full pitch.',
      relationshipStrength: 4,
      tags: ['investor', 'series-c'],
      notes: 'Interested in leading the Series C round.',
      rawRow: 99
    };

    const scoring = calculateScores(unknownInvestor);
    expect(scoring.recommendedMove).toContain('Send the full Series C pitch deck to Benchmark');
    expect(scoring.riskIfIgnored).toContain('Loses momentum on Benchmark interest');
    expect(scoring.compositeScore).toBeGreaterThan(85);

    // Verify name invariance: Changing name to any random string produces identical recommendations
    const renamedContact: Contact = {
      ...unknownInvestor,
      name: 'Completely Random Name 987'
    };
    const renamedScoring = calculateScores(renamedContact);
    expect(renamedScoring.recommendedMove).toBe(scoring.recommendedMove);
    expect(renamedScoring.riskIfIgnored).toBe(scoring.riskIfIgnored);
    expect(renamedScoring.compositeScore).toBe(scoring.compositeScore);
  });

  it('dynamically generates CTO referral recommendations for unknown mentor (John Smith)', () => {
    const unknownMentor: Contact = {
      name: 'John Smith',
      role: 'Former CTO',
      company: 'Datadog',
      howSheKnowsThem: 'mentor',
      daysSinceLastContact: 15,
      lastContactChannel: 'call',
      lastContactSummary: 'Offered to help with CTO search. Knows 3 strong candidates.',
      relationshipStrength: 4,
      tags: ['cto-search', 'mentor'],
      notes: 'Offered to introduce VP Eng leaders.',
      rawRow: 100
    };

    const scoring = calculateScores(unknownMentor);
    expect(scoring.recommendedMove).toContain('request introductions to the candidate profiles');
    expect(scoring.riskIfIgnored).toContain('Fails to capitalize on a warm executive referral pipeline');
    expect(scoring.compositeScore).toBeGreaterThan(80);
  });
});

