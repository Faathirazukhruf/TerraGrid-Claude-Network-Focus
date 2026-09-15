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
export declare const ContactSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodDefault<z.ZodString>;
    company: z.ZodDefault<z.ZodString>;
    howSheKnowsThem: z.ZodDefault<z.ZodString>;
    daysSinceLastContact: z.ZodDefault<z.ZodNumber>;
    lastContactChannel: z.ZodDefault<z.ZodString>;
    lastContactSummary: z.ZodDefault<z.ZodString>;
    relationshipStrength: z.ZodDefault<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodDefault<z.ZodString>;
    rawRow: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    role: string;
    company: string;
    howSheKnowsThem: string;
    daysSinceLastContact: number;
    lastContactChannel: string;
    lastContactSummary: string;
    relationshipStrength: number;
    tags: string[];
    notes: string;
    rawRow: number;
}, {
    name: string;
    role?: string | undefined;
    company?: string | undefined;
    howSheKnowsThem?: string | undefined;
    daysSinceLastContact?: number | undefined;
    lastContactChannel?: string | undefined;
    lastContactSummary?: string | undefined;
    relationshipStrength?: number | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    rawRow?: number | undefined;
}>;
export type Contact = z.infer<typeof ContactSchema>;
export interface GoalMatch {
    goalId: GoalId;
    goalTitle: string;
    relevanceScore: number;
    reasons: string[];
}
export interface ContactScoring {
    goalAlignmentScore: number;
    relationshipLeverageScore: number;
    actionabilityScore: number;
    compositeScore: number;
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
