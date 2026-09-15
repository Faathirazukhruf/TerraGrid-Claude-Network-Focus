---
name: weekly-network-focus
description: Generates the weekly TerraGrid Network Focus brief by running deterministic scoring on the executive roster and synthesizing high-leverage strategic relationship priorities.
---

# Weekly Network Focus Skill

This Skill guides Claude Code to generate a concise, actionable 1-page **Weekly Network Focus Brief** for the TerraGrid Chief of Staff and CEO.

The tool combines deterministic scoring (goal alignment, relationship leverage, dormancy, and data quality checks) with Claude's executive synthesis to ensure zero hallucination, strict factual grounding, and high-impact weekly relationship moves.

---

## Workflow Steps

When the user runs `/weekly-network-focus` or asks for the weekly network brief, execute the following workflow:

### Step 1: Run the Deterministic Intelligence Engine
Execute the analysis command in the workspace:
```bash
npm run analyze
```
This runs the deterministic parser and scorer on `data/Network Roster Terragrid.xlsx` and saves structured output to `data/latest_analysis.json`.

### Step 2: Read the Structured Analysis Output
Inspect the generated `data/latest_analysis.json` to review:
1. `topWeeklyFocus`: Top 3–5 high-momentum contacts scored by goal relevance and actionability.
2. `dormantHighLeverage`: 2–3 contacts with 60+ days of silence who have proven leverage (e.g., pre-seed investors, warm mentors).
3. `qualityFlags`:
   - `missingGoalContacts`: Target ecosystem entities with zero representation (e.g., a16z, MIRI).
   - `ambiguousNames`: Contacts sharing first names or duplicate entries (e.g., David Liu vs. David Park).
   - `thinContextContacts`: Contacts with under 5 words of context or no follow-up depth.
   - `staleContacts`: Contacts with >90 days since last contact.

### Step 3: Synthesize the Weekly Network Focus Brief
Draft the 1-page executive brief using the exact format below. Apply executive-level phrasing while strictly preserving the underlying facts and notes:

```markdown
# 🎯 TerraGrid Weekly Network Focus
**Period**: Week of [Current Date] | **Prepared for**: CEO & Chief of Staff

---

## 📌 Executive Summary
Brief 2-3 sentence overview of this week's relationship posture across the 3 quarterly goals:
1. **Series C Fundraise**: $40M @ $200M valuation target.
2. **CTO Hire**: 50-to-200 engineering org scale.
3. **AI Safety**: Research and institutional partnerships.

---

## 🚀 1. Top People to Invest in This Week (Actionable Priorities)
*(List the 3-5 prioritized contacts)*

### [1] [Name] — [Role], [Company]
- **Quarterly Goal**: [Goal Title] (Score: [Composite Score]/100)
- **Why They Matter**: [Specific factual justification from notes/history]
- **Recommended Move**: [Concrete, low-friction executive action]
- **Risk of Inaction**: [Concrete cost or missed momentum if neglected this week]

---

## ⏳ 2. Dormant High-Leverage Relationships (60+ Days Inactive)
*(List 2-3 high-leverage relationships needing reactivation)*

### [1] [Name] — [Role], [Company] (Relationship Strength: [X]/5)
- **Dormancy Status**: Last contacted [X] days ago via [Channel]
- **Strategic Leverage**: [Why this relationship has high latent value]
- **Reactivation Move**: [Specific low-friction re-engagement message/action]
- **Risk of Inaction**: [Downside of letting the relationship stay cold]

---

## ⚠️ 3. Data Health, Missing Targets & Strategic Blindspots
- **Missing Goal Targets**: Clearly list strategic entities mentioned in quarterly goals that have ZERO contacts in the roster (e.g., a16z for Series C, MIRI for AI Safety). Note that no contacts were invented.
- **Ambiguous Name Watch**: Note any shared first names (e.g., David Liu vs David Park) to prevent executive miscommunication.
- **Thin Context Warning**: Note contacts with insufficient notes where outreach should not be attempted without further research.
- **Stale Records**: List contacts exceeding 90 days without touchpoints.

---
```

---

## Critical Rules & Guardrails

1. **Zero Hallucination**: Never invent people, companies, past conversations, or promises not in the source roster.
2. **No Cold Aspirational Recommendations**: Do NOT recommend famous CEOs or luminaries (e.g. Jensen Huang, Demis Hassabis) solely because of prestige if they have low relationship strength (1/5) and no warm active hook.
3. **Handle Missing Targets Explicitly**: When a target firm (such as a16z) has no representation, report it as a blindspot rather than fabricating a contact.
4. **Disambiguate Names**: Always use full names and companies to avoid confusing contacts with shared first names.
5. **Explainability**: Every recommendation must clearly state the underlying reason (e.g., "Replied to teaser deck and requested full pitch").

---

## Troubleshooting & Operator Notes

- **To update the roster**: Place the new Excel file in `data/Network Roster Terragrid.xlsx` and re-run.
- **To run against a custom file**: Run `npx tsx src/cli.ts path/to/file.xlsx`.
- **To modify quarterly goals**: Edit `src/goals.ts` and rebuild.
