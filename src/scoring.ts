import { Contact, GoalId, GoalMatch, ContactScoring, ScoredContact, StrategicGoal } from './types.js';
import { TERRAGRID_GOALS } from './goals.js';

export function matchGoals(contact: Contact, goals: StrategicGoal[] = TERRAGRID_GOALS): GoalMatch[] {
  const matches: GoalMatch[] = [];
  const fullText = `${contact.role} ${contact.company} ${contact.howSheKnowsThem} ${contact.tags.join(' ')} ${contact.lastContactSummary} ${contact.notes}`.toLowerCase();
  const tagsLower = contact.tags.map(t => t.toLowerCase());
  const companyLower = contact.company.toLowerCase();
  const roleLower = contact.role.toLowerCase();

  for (const goal of goals) {
    let score = 0;
    const reasons: string[] = [];

    // Tag matches (high signal)
    if (goal.id === 'series_c') {
      if (tagsLower.includes('series-c') || tagsLower.includes('series c')) {
        score += 45;
        reasons.push('Tagged with Series C');
      }
      if (tagsLower.includes('investor')) {
        score += 25;
        reasons.push('Tagged as Investor');
      }
    } else if (goal.id === 'cto_hire') {
      if (tagsLower.includes('cto-candidate') || tagsLower.includes('cto-search') || tagsLower.includes('cto-candidate-maybe')) {
        score += 45;
        reasons.push('Tagged as CTO candidate / search lead');
      }
      if (tagsLower.includes('talent') || tagsLower.includes('talent-network') || tagsLower.includes('eng-org')) {
        score += 30;
        reasons.push('Tagged as Engineering Talent Connector / Org Advisor');
      }
    } else if (goal.id === 'ai_safety') {
      if (tagsLower.includes('ai-safety') || tagsLower.includes('ai safety') || tagsLower.includes('ai-safety-adjacent')) {
        score += 45;
        reasons.push('Tagged with AI Safety focus');
      }
      if (tagsLower.includes('researcher') || tagsLower.includes('academic')) {
        score += 25;
        reasons.push('AI Safety Researcher / Academic affiliation');
      }
    }

    // Target entity match (company or institutions)
    for (const entity of goal.targetEntities) {
      const entityLower = entity.toLowerCase();
      if (companyLower.includes(entityLower) || fullText.includes(entityLower)) {
        score += 25;
        reasons.push(`Affiliated with target ecosystem entity "${entity}"`);
        break;
      }
    }

    // Role keyword match
    if (goal.id === 'series_c' && (roleLower.includes('partner') || roleLower.includes('investor') || roleLower.includes('founder') && companyLower.includes('vc'))) {
      score += 15;
      reasons.push(`Relevant venture role: ${contact.role}`);
    } else if (goal.id === 'cto_hire' && (roleLower.includes('cto') || roleLower.includes('vp engineering') || roleLower.includes('engineering manager') || roleLower.includes('talent') || roleLower.includes('advisor'))) {
      score += 20;
      reasons.push(`Relevant technical/talent role: ${contact.role}`);
    } else if (goal.id === 'ai_safety' && (roleLower.includes('researcher') || roleLower.includes('alignment') || roleLower.includes('eval'))) {
      score += 20;
      reasons.push(`AI safety research role: ${contact.role}`);
    }

    // Notes / context keywords match
    for (const kw of goal.keywords) {
      if (fullText.includes(kw) && !reasons.some(r => r.toLowerCase().includes(kw))) {
        score += 5;
      }
    }

    // Normalize max score to 100
    if (score > 0) {
      matches.push({
        goalId: goal.id,
        goalTitle: goal.title,
        relevanceScore: Math.min(score, 100),
        reasons
      });
    }
  }

  // Sort descending by relevance
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return matches;
}

export function calculateScores(contact: Contact): ContactScoring {
  const matchedGoals = matchGoals(contact);
  const bestGoalMatch = matchedGoals[0];
  const goalAlignmentScore = bestGoalMatch ? bestGoalMatch.relevanceScore : 0;

  // Relationship Leverage Score (1-5 scaled to 0-100, modulated by depth)
  let relationshipLeverageScore = (contact.relationshipStrength / 5) * 80;
  if (['mentor', 'advisor', 'ex-colleague', 'investor'].includes(contact.howSheKnowsThem.toLowerCase())) {
    relationshipLeverageScore += 20;
  } else if (['peer', 'intro'].includes(contact.howSheKnowsThem.toLowerCase())) {
    relationshipLeverageScore += 10;
  }
  relationshipLeverageScore = Math.min(100, Math.max(0, relationshipLeverageScore));

  // Actionability & Momentum Score
  let actionabilityScore = 50;
  const notesLower = `${contact.lastContactSummary} ${contact.notes}`.toLowerCase();
  const tagsLower = contact.tags.map(t => t.toLowerCase());

  // Specific high-intent signals in notes
  if (notesLower.includes('full pitch') || notesLower.includes('teaser deck')) {
    actionabilityScore += 35;
  }
  if (notesLower.includes('offered to help') || notesLower.includes('never followed up')) {
    actionabilityScore += 30;
  }
  if (notesLower.includes('revisit in a month') || notesLower.includes('window opens')) {
    actionabilityScore += 30;
  }
  if (notesLower.includes('owed-favor') || notesLower.includes('owes her one')) {
    actionabilityScore += 25;
  }
  if (notesLower.includes('unanswered') || notesLower.includes('worth one more nudge')) {
    actionabilityScore += 20;
  }
  if (notesLower.includes('open to chat') || notesLower.includes('concrete questions') || notesLower.includes('surface cto candidates')) {
    actionabilityScore += 20;
  }

  // Negative / cold signals
  if (tagsLower.includes('aspirational') || notesLower.includes('no substantive exchange') || notesLower.includes('stretch to reach out cold')) {
    actionabilityScore -= 40;
  }
  if (notesLower.includes('not engaged') || notesLower.includes('polite but not engaged') || notesLower.includes('not the right thread')) {
    actionabilityScore -= 30;
  }
  if (tagsLower.includes('lukewarm') || notesLower.includes('slow to engage')) {
    actionabilityScore -= 15;
  }
  if (tagsLower.includes('personal') && !tagsLower.some(t => t.includes('investor') || t.includes('cto') || t.includes('safety'))) {
    actionabilityScore = 10; // Personal contact with no business overlap
  }

  // Recency modulation
  if (contact.daysSinceLastContact <= 30) {
    actionabilityScore += 15; // Active momentum
  } else if (contact.daysSinceLastContact > 90) {
    actionabilityScore -= 15; // Stale decay
  }

  actionabilityScore = Math.min(100, Math.max(0, actionabilityScore));

  // Composite Score: Heavy weight on strategic goal alignment and actionability
  let compositeScore = 0;
  if (goalAlignmentScore === 0) {
    compositeScore = 0; // If no goal relevance (e.g. personal physician), do not rank in weekly business focus
  } else {
    compositeScore =
      0.45 * goalAlignmentScore +
      0.35 * actionabilityScore +
      0.20 * relationshipLeverageScore;
  }
  compositeScore = Math.round(Math.min(100, Math.max(0, compositeScore)));

  // Dormant High-Leverage Evaluation
  // Must be >= 60 days since last contact, have strategic goal relevance >= 40, relationship strength >= 2,
  // and must NOT be an empty cold aspirational contact
  const isDormant = contact.daysSinceLastContact >= 60;
  const isHighLeverage =
    goalAlignmentScore >= 40 &&
    contact.relationshipStrength >= 2 &&
    !tagsLower.includes('aspirational') &&
    !notesLower.includes('no substantive exchange') &&
    !notesLower.includes('not engaged');

  const isDormantHighLeverage = isDormant && isHighLeverage;
  const dormancyReasons: string[] = [];
  if (isDormantHighLeverage) {
    dormancyReasons.push(`Last contacted ${contact.daysSinceLastContact} days ago (exceeds 60-day dormancy threshold)`);
    dormancyReasons.push(`High relationship leverage (Strength ${contact.relationshipStrength}/5 as ${contact.howSheKnowsThem})`);
    if (bestGoalMatch) {
      dormancyReasons.push(`Direct strategic alignment with: ${bestGoalMatch.goalTitle}`);
    }
  }

  // Generate priority reasons, recommendations, and risks
  const priorityReasons: string[] = [];
  if (bestGoalMatch) {
    priorityReasons.push(...bestGoalMatch.reasons);
  }
  if (contact.daysSinceLastContact <= 30) {
    priorityReasons.push(`Recent contact (${contact.daysSinceLastContact} days ago) provides immediate momentum`);
  }

  const { recommendedMove, riskIfIgnored } = generateRecommendationAndRisk(contact, bestGoalMatch?.goalId);

  return {
    goalAlignmentScore,
    relationshipLeverageScore,
    actionabilityScore,
    compositeScore,
    matchedGoals,
    isDormantHighLeverage,
    dormancyReasons,
    priorityReasons,
    recommendedMove,
    riskIfIgnored
  };
}

function generateRecommendationAndRisk(
  contact: Contact,
  primaryGoalId?: GoalId
): { recommendedMove: string; riskIfIgnored: string } {
  const notesLower = `${contact.lastContactSummary} ${contact.notes}`.toLowerCase();
  const tagsLower = contact.tags.map(t => t.toLowerCase());
  const company = contact.company || 'target organization';

  // 1. Teaser deck sent / full pitch requested
  if (notesLower.includes('full pitch') || notesLower.includes('teaser deck')) {
    return {
      recommendedMove: `Send the full Series C pitch deck to ${company} and propose a 30-minute deep-dive meeting next week.`,
      riskIfIgnored: `Loses momentum on ${company} interest; partner bandwidth may be allocated to competing Q3 deals.`
    };
  }

  // 2. Mentorship / CTO candidate referral offer
  if (
    (notesLower.includes('offered to help') || notesLower.includes('cto search') || notesLower.includes('strong candidates')) &&
    (primaryGoalId === 'cto_hire' || tagsLower.includes('mentor') || tagsLower.includes('cto-search'))
  ) {
    return {
      recommendedMove: `Follow up to thank them for the offer and request introductions to the candidate profiles they highlighted.`,
      riskIfIgnored: `Fails to capitalize on a warm executive referral pipeline from a trusted mentor/connector.`
    };
  }

  // 3. Revisit in a month / Timing window for candidate
  if (notesLower.includes('revisit in a month') || notesLower.includes('window opens')) {
    return {
      recommendedMove: `Send a targeted note to initiate the upcoming conversation window regarding the TerraGrid CTO role.`,
      riskIfIgnored: `Misses the optimal engagement window before the candidate enters other late-stage leadership interview loops.`
    };
  }

  // 4. AI Safety Research & Evaluation paper follow-up
  if (
    primaryGoalId === 'ai_safety' &&
    (notesLower.includes('eval paper') || notesLower.includes('concrete questions') || notesLower.includes('paper'))
  ) {
    return {
      recommendedMove: `Send a structured follow-up email proposing concrete evaluation questions to explore technical alignment collaboration with ${company}.`,
      riskIfIgnored: `Fails to establish institutional credibility and technical touchpoints with ${company}.`
    };
  }

  // 5. High-leverage dormant investor (pre-seed / seed relationship)
  if (
    contact.daysSinceLastContact >= 60 &&
    (notesLower.includes('pre-seed') || notesLower.includes('seed round') || contact.howSheKnowsThem.toLowerCase() === 'investor') &&
    primaryGoalId === 'series_c'
  ) {
    return {
      recommendedMove: `Send a personalized email with a brief Series C update and request a 20-minute catch-up call on ${company} signaling and round dynamics.`,
      riskIfIgnored: `Leaves a key institutional investor champion and signaling partner cold ahead of the Q3 Series C process.`
    };
  }

  // 6. Owed favor / Peer executive
  if (notesLower.includes('owed-favor') || notesLower.includes('owes her one') || tagsLower.includes('owed-favor')) {
    return {
      recommendedMove: `Send a brief peer note activating the relationship to request targeted executive introductions or strategic advice.`,
      riskIfIgnored: `Social capital from previous favors fades without being leveraged for quarterly priorities.`
    };
  }

  // 7. Unanswered follow-up / Nudge
  if (notesLower.includes('unanswered') || notesLower.includes('one more nudge')) {
    return {
      recommendedMove: `Send a low-friction nudge email referencing the previous discussion to determine interest.`,
      riskIfIgnored: `Discussion stalls indefinitely without a definitive next step.`
    };
  }

  // 8. Open in a year / Scaling leadership candidate
  if (notesLower.includes('open in a year') || notesLower.includes('waiting for the right opportunity') || notesLower.includes('open to chat')) {
    return {
      recommendedMove: `Schedule an informal catch-up to share TerraGrid's scaling roadmap and test appetite for advisory or leadership transition.`,
      riskIfIgnored: `Candidate signs with competing growth-stage startups without TerraGrid having pitched the vision.`
    };
  }

  // Fallbacks based on goal
  if (primaryGoalId === 'series_c') {
    return {
      recommendedMove: `Send a concise update regarding TerraGrid's growth metrics and request a 20-minute discussion regarding Series C round timing.`,
      riskIfIgnored: `Leaves venture interest uncultivated, weakening competitive tension for the upcoming Series C fundraise.`
    };
  } else if (primaryGoalId === 'cto_hire') {
    return {
      recommendedMove: `Reach out with specific profile requirements for the 50-to-200 engineering scale CTO role and ask for recommended candidates.`,
      riskIfIgnored: `Extends executive search timeline and leaves engineering leadership vacant during critical scaling phase.`
    };
  } else if (primaryGoalId === 'ai_safety') {
    return {
      recommendedMove: `Follow up with technical thoughts on alignment research and explore mutual research touchpoints with ${company}.`,
      riskIfIgnored: `TerraGrid remains isolated from key AI safety academic and industry research circles.`
    };
  }

  return {
    recommendedMove: `Schedule a brief touchpoint to maintain relationship warmth.`,
    riskIfIgnored: `Relationship drifts into dormancy without clear mutual value creation.`
  };
}

export function scoreAllContacts(contacts: Contact[]): ScoredContact[] {
  return contacts.map(contact => ({
    contact,
    scoring: calculateScores(contact)
  }));
}
