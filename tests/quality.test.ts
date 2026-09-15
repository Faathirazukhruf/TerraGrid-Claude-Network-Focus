import { describe, it, expect } from 'vitest';
import { detectQualityFlags } from '../src/quality.js';
import { Contact, StrategicGoal } from '../src/types.js';

describe('Data Quality & Failure Mode Detection', () => {
  const mockGoals: StrategicGoal[] = [
    {
      id: 'series_c',
      title: 'Series C Round',
      target: '$40M',
      description: 'Need tier 1 investors',
      targetEntities: ['Sequoia', 'a16z'],
      keyCriteria: ['Lead investor'],
      keywords: ['series-c', 'investor']
    }
  ];

  it('detects missing goal target entities without hallucinating contacts', () => {
    const contacts: Contact[] = [
      {
        name: 'Marcus Wei',
        role: 'Partner',
        company: 'Sequoia Capital',
        howSheKnowsThem: 'investor',
        daysSinceLastContact: 10,
        lastContactChannel: 'email',
        lastContactSummary: 'Positive reply.',
        relationshipStrength: 4,
        tags: ['series-c', 'investor'],
        notes: 'Sequoia partner.',
        rawRow: 2
      }
    ];

    const flags = detectQualityFlags(contacts, mockGoals);
    expect(flags.missingGoalContacts.length).toBe(1);
    expect(flags.missingGoalContacts[0].missingEntity).toBe('a16z');
    expect(flags.missingGoalContacts[0].goalId).toBe('series_c');
  });

  it('detects ambiguous name matches and shared first names', () => {
    const contacts: Contact[] = [
      {
        name: 'David Liu',
        role: 'Senior Engineering Manager',
        company: 'Google',
        howSheKnowsThem: 'ex-colleague',
        daysSinceLastContact: 36,
        lastContactChannel: 'meeting',
        lastContactSummary: 'Coffee chat.',
        relationshipStrength: 3,
        tags: ['cto-candidate'],
        notes: 'Strong candidate.',
        rawRow: 8
      },
      {
        name: 'David Park',
        role: 'VP Engineering',
        company: 'Notion',
        howSheKnowsThem: 'event',
        daysSinceLastContact: 40,
        lastContactChannel: 'email',
        lastContactSummary: 'Follow-up email.',
        relationshipStrength: 3,
        tags: ['cto-candidate'],
        notes: 'Unanswered follow-up.',
        rawRow: 9
      }
    ];

    const flags = detectQualityFlags(contacts, mockGoals);
    expect(flags.ambiguousNames.length).toBeGreaterThan(0);
    expect(flags.ambiguousNames.some(a => a.details.includes('David Liu') && a.details.includes('David Park'))).toBe(true);
  });

  it('flags contacts with thin context or insufficient notes', () => {
    const thinContact: Contact = {
      name: 'Anjali Sharma',
      role: 'Founder',
      company: '(Stealth)',
      howSheKnowsThem: 'event',
      daysSinceLastContact: 13,
      lastContactChannel: 'event',
      lastContactSummary: 'Met at conference.',
      relationshipStrength: 1,
      tags: ['stealth', 'met-once'],
      notes: "Met at conference. No follow-up depth. Don't know what she's working on.",
      rawRow: 10
    };

    const flags = detectQualityFlags([thinContact], mockGoals);
    expect(flags.thinContextContacts.length).toBe(1);
    expect(flags.thinContextContacts[0].name).toBe('Anjali Sharma');
  });

  it('flags stale contacts with last contact exceeding 90 days', () => {
    const staleContact: Contact = {
      name: 'Priya Mehta',
      role: 'Partner',
      company: 'Index Ventures',
      howSheKnowsThem: 'investor',
      daysSinceLastContact: 128,
      lastContactChannel: 'meeting',
      lastContactSummary: 'Coffee around seed round.',
      relationshipStrength: 2,
      tags: ['investor', 'dormant'],
      notes: 'Strong fit for Series C but communication has gone cold.',
      rawRow: 16
    };

    const flags = detectQualityFlags([staleContact], mockGoals);
    expect(flags.staleContacts.length).toBe(1);
    expect(flags.staleContacts[0].name).toBe('Priya Mehta');
    expect(flags.staleContacts[0].daysSinceLastContact).toBe(128);
  });
});
