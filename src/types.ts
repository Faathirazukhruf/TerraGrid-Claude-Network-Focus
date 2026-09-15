import { z } from 'zod';

export type GoalId = 'series_c' | 'cto_hire' | 'ai_safety';

export interface StrategicGoal {
  id: GoalId;
  title: string;
  target: string;
  description: string;
  targetEntities: string[];
  keyCriteria: string[];
  keywords: string[];
}

export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().default(''),
  company: z.string().default(''),
  howSheKnowsThem: z.string().default(''),
  daysSinceLastContact: z.number().int().nonnegative().default(0),
  lastContactChannel: z.string().default(''),
  lastContactSummary: z.string().default(''),
  relationshipStrength: z.number().min(1).max(5).default(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
  rawRow: z.number().int().default(0)
});

export type Contact = z.infer<typeof ContactSchema>;

export interface GoalMatch {
  goalId: GoalId;
  goalTitle: string;
  relevanceScore: number; // 0 - 100
  reasons: string[];
}

export interface ContactScoring {
  goalAlignmentScore: number;      // 0 - 100
  relationshipLeverageScore: number; // 0 - 100
  actionabilityScore: number;       // 0 - 100
  compositeScore: number;           // 0 - 100
  matchedGoals: GoalMatch[];
  isDormantHighLeverage: boolean;
  dormancyReasons: string[];
  priorityReasons: string[];
  riskIfIgnored: string;
  recommendedMove: string;
}

export interface ScoredContact {
  contact: Contact;
  scoring: ContactScoring;
}

export interface MissingGoalContactAlert {
  goalId: GoalId;
  goalTitle: string;
  missingEntity: string;
  rationale: string;
}

export interface AmbiguousNameAlert {
  name: string;
  matchingRows: number[];
  details: string;
}

export interface ThinContextAlert {
  name: string;
  issues: string[];
}

export interface StaleContactAlert {
  name: string;
  daysSinceLastContact: number;
  warning: string;
}

export interface QualityFlags {
  missingGoalContacts: MissingGoalContactAlert[];
  ambiguousNames: AmbiguousNameAlert[];
  thinContextContacts: ThinContextAlert[];
  staleContacts: StaleContactAlert[];
}

export interface AnalysisResult {
  generatedAt: string;
  sourceFile: string;
  totalContacts: number;
  activeQuarterlyGoals: StrategicGoal[];
  topWeeklyFocus: ScoredContact[];
  dormantHighLeverage: ScoredContact[];
  allScoredContacts: ScoredContact[];
  qualityFlags: QualityFlags;
  summaryMetrics: {
    contactsByGoal: Record<GoalId, number>;
    dormantHighLeverageCount: number;
    thinContextCount: number;
    staleDataCount: number;
  };
}
