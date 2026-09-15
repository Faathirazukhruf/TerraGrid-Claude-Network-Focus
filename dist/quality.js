"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectQualityFlags = detectQualityFlags;
const goals_js_1 = require("./goals.js");
function detectQualityFlags(contacts, goals = goals_js_1.TERRAGRID_GOALS) {
    const missingGoalContacts = [];
    const ambiguousNames = [];
    const thinContextContacts = [];
    const staleContacts = [];
    // 1. Missing Goal Contacts / Target Entities Detection
    for (const goal of goals) {
        for (const targetEntity of goal.targetEntities) {
            const entityLower = targetEntity.toLowerCase();
            const hasMatch = contacts.some(c => {
                const full = `${c.company} ${c.role} ${c.notes} ${c.tags.join(' ')}`.toLowerCase();
                return full.includes(entityLower);
            });
            if (!hasMatch) {
                missingGoalContacts.push({
                    goalId: goal.id,
                    goalTitle: goal.title,
                    missingEntity: targetEntity,
                    rationale: `Quarterly goal "${goal.title}" identifies "${targetEntity}" as a strategic target, but no active contact or affiliate is present in the network roster.`
                });
            }
        }
    }
    // 2. Ambiguous Name Detection
    // Check for exact duplicate full names, or duplicate first names across contacts
    const firstNameMap = new Map();
    const fullNameMap = new Map();
    for (const contact of contacts) {
        const fullName = contact.name.trim().toLowerCase();
        const firstName = fullName.split(/\s+/)[0];
        if (!fullNameMap.has(fullName)) {
            fullNameMap.set(fullName, []);
        }
        fullNameMap.get(fullName).push({ contact, row: contact.rawRow });
        if (!firstNameMap.has(firstName)) {
            firstNameMap.set(firstName, []);
        }
        firstNameMap.get(firstName).push({ contact, row: contact.rawRow });
    }
    // Exact duplicates
    for (const [name, occurrences] of fullNameMap.entries()) {
        if (occurrences.length > 1) {
            ambiguousNames.push({
                name: occurrences[0].contact.name,
                matchingRows: occurrences.map(o => o.row),
                details: `Duplicate contact entry found for "${occurrences[0].contact.name}" across rows ${occurrences.map(o => o.row).join(', ')}.`
            });
        }
    }
    // First name collisions (e.g. David Liu vs David Park, Jensen Huang vs Jensen Carlsson)
    for (const [firstName, occurrences] of firstNameMap.entries()) {
        if (occurrences.length > 1 && firstName.length > 2) {
            const distinctFullNames = Array.from(new Set(occurrences.map(o => o.contact.name)));
            if (distinctFullNames.length > 1) {
                ambiguousNames.push({
                    name: `Shared first name "${occurrences[0].contact.name.split(' ')[0]}"`,
                    matchingRows: occurrences.map(o => o.row),
                    details: `Multiple contacts share the first name "${occurrences[0].contact.name.split(' ')[0]}": ${distinctFullNames.join(' and ')} (Rows ${occurrences.map(o => o.row).join(', ')}). Always reference by full name.`
                });
            }
        }
    }
    // 3. Thin Context Detection
    for (const contact of contacts) {
        const issues = [];
        const notes = contact.notes.trim();
        const summary = contact.lastContactSummary.trim();
        if (!notes || notes.length < 25 || notes.split(/\s+/).length < 5) {
            issues.push('Very brief or missing notes (under 5 words / 25 characters)');
        }
        if (!summary || summary.length < 15) {
            issues.push('Missing or non-substantive last contact summary');
        }
        if (contact.tags.length === 0 || (contact.tags.length === 1 && contact.tags[0] === 'met-once')) {
            issues.push('Lacks specific categorizing tags');
        }
        if (notes.toLowerCase().includes("don't know what she's working on") || notes.toLowerCase().includes('no follow-up depth')) {
            issues.push('Explicit note indicating lack of follow-up depth or unknown current role');
        }
        if (issues.length >= 2 || notes.toLowerCase().includes("don't know what she's working on")) {
            thinContextContacts.push({
                name: contact.name,
                issues
            });
        }
    }
    // 4. Stale Data Detection (> 90 days)
    for (const contact of contacts) {
        if (contact.daysSinceLastContact >= 90) {
            staleContacts.push({
                name: contact.name,
                daysSinceLastContact: contact.daysSinceLastContact,
                warning: `Last contact was ${contact.daysSinceLastContact} days ago (${contact.lastContactChannel || 'unknown channel'}). Relationship status may have drifted; verify current context before high-stakes outreach.`
            });
        }
    }
    return {
        missingGoalContacts,
        ambiguousNames,
        thinContextContacts,
        staleContacts
    };
}
//# sourceMappingURL=quality.js.map