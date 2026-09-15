import { AnalysisResult, GoalId, ScoredContact, StrategicGoal } from './types.js';
import { TERRAGRID_GOALS } from './goals.js';
import { parseRosterFile } from './parser.js';
import { scoreAllContacts } from './scoring.js';
import { detectQualityFlags } from './quality.js';

export function analyzeRoster(
  filePath: string,
  goals: StrategicGoal[] = TERRAGRID_GOALS
): AnalysisResult {
  const contacts = parseRosterFile(filePath);
  const scoredContacts = scoreAllContacts(contacts);
  const qualityFlags = detectQualityFlags(contacts, goals);

  // Filter and sort for Top Weekly Focus (3 to 5 contacts)
  // Must have compositeScore > 0, sorted descending by compositeScore
  const activeCandidates = scoredContacts
    .filter(sc => sc.scoring.compositeScore > 0 && !sc.scoring.isDormantHighLeverage)
    .sort((a, b) => b.scoring.compositeScore - a.scoring.compositeScore);

  // Pick top 4-5 actionable contacts ensuring diversity across goals where possible
  const topWeeklyFocus: ScoredContact[] = activeCandidates.slice(0, 5);

  // Dormant High-Leverage Relationships (2 to 3 contacts)
  const dormantHighLeverage = scoredContacts
    .filter(sc => sc.scoring.isDormantHighLeverage)
    .sort((a, b) => {
      // Prioritize by relationship strength and goal alignment
      const scoreA = a.scoring.relationshipLeverageScore + a.scoring.goalAlignmentScore;
      const scoreB = b.scoring.relationshipLeverageScore + b.scoring.goalAlignmentScore;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  // Calculate summary metrics
  const contactsByGoal: Record<GoalId, number> = {
    series_c: 0,
    cto_hire: 0,
    ai_safety: 0
  };

  for (const sc of scoredContacts) {
    for (const match of sc.scoring.matchedGoals) {
      if (contactsByGoal[match.goalId] !== undefined) {
        contactsByGoal[match.goalId]++;
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: filePath,
    totalContacts: contacts.length,
    activeQuarterlyGoals: goals,
    topWeeklyFocus,
    dormantHighLeverage,
    allScoredContacts: scoredContacts.sort((a, b) => b.scoring.compositeScore - a.scoring.compositeScore),
    qualityFlags,
    summaryMetrics: {
      contactsByGoal,
      dormantHighLeverageCount: dormantHighLeverage.length,
      thinContextCount: qualityFlags.thinContextContacts.length,
      staleDataCount: qualityFlags.staleContacts.length
    }
  };
}
