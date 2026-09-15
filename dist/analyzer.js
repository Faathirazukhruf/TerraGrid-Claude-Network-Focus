"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRoster = analyzeRoster;
const goals_js_1 = require("./goals.js");
const parser_js_1 = require("./parser.js");
const scoring_js_1 = require("./scoring.js");
const quality_js_1 = require("./quality.js");
function analyzeRoster(filePath, goals = goals_js_1.TERRAGRID_GOALS) {
    const contacts = (0, parser_js_1.parseRosterFile)(filePath);
    const scoredContacts = (0, scoring_js_1.scoreAllContacts)(contacts);
    const qualityFlags = (0, quality_js_1.detectQualityFlags)(contacts, goals);
    // Filter and sort for Top Weekly Focus (3 to 5 contacts)
    // Must have compositeScore > 0, sorted descending by compositeScore
    const activeCandidates = scoredContacts
        .filter(sc => sc.scoring.compositeScore > 0 && !sc.scoring.isDormantHighLeverage)
        .sort((a, b) => b.scoring.compositeScore - a.scoring.compositeScore);
    // Pick top 4-5 actionable contacts ensuring diversity across goals where possible
    const topWeeklyFocus = activeCandidates.slice(0, 5);
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
    const contactsByGoal = {
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
//# sourceMappingURL=analyzer.js.map