# 📄 Product Requirements Document (PRD)
## TerraGrid Strategic Network Focus Intelligence Engine & Claude Skill

**Product**: TerraGrid Weekly Network Focus  
**Target User**: Chief of Staff (and CEO) at TerraGrid (50-person growth-stage SaaS company)  
**Version**: 1.0 (Final AI Builder Partner Assessment)  

---

## 1. Problem Statement & User Persona

### Problem
TerraGrid's CEO maintains hundreds of professional contacts across investors, executive candidates, advisors, peers, and research communities. However, weekly calendar time is predominantly consumed by whoever proactively schedules a meeting or reaches out first, rather than the relationships that decisively move the needle on quarterly company goals.

### User Persona
- **Primary Operator**: Chief of Staff (non-technical or semi-technical operator). Needs a 1-click, repeatable weekly process to extract relationship priorities, dormant strategic allies, and data quality warnings without debugging complex infrastructure.
- **Executive Consumer**: CEO. Needs a crisp, 1-page weekly brief outlining exactly **who** to contact, **why** they matter for a quarterly goal, what specific **move** to make, and what **risk** is incurred if they fail to act.

---

## 2. Strategic Goals (Current Quarter)

1. **Raise Series C by end of Q3**: Target $40M at $200M valuation. Need top-tier investor conviction and syndicate signaling (e.g., Sequoia, Greylock, a16z, Index, Lightspeed).
2. **Hire Chief Technology Officer (CTO)**: Need a technical leader with direct experience scaling engineering teams from 50 to 200+ engineers (sourcing candidates and activating mentors/talent networks).
3. **Build AI Safety Relationships**: Establish institutional credibility and partnerships with AI safety organizations, researchers, and academic hubs (Anthropic, ARC Evals, MIRI, EA Global, Stanford/MIT CSAIL).

---

## 3. Data Inputs & Schema

### Input Data
- **Source**: Spreadsheet (`data/Network Roster Terragrid.xlsx`)
- **Schema**:
  | Column Name | Type | Description |
  | :--- | :--- | :--- |
  | `Name` | `string` | Full name of the contact |
  | `Role` | `string` | Current title / position |
  | `Company` | `string` | Current organization / firm |
  | `How she knows them` | `string` | Relationship origin (e.g., `investor`, `mentor`, `intro`, `peer`, `ex-colleague`) |
  | `Days since last contact` | `number` | Integer elapsed days since the last recorded interaction |
  | `Last contact channel` | `string` | `email`, `call`, `meeting`, `event` |
  | `Last contact summary` | `string` | Narrative summary of the previous touchpoint |
  | `Relationship strength (1-5)` | `number` | Subjective trust/warmth rating (1 = cold/met once, 5 = trusted inner circle) |
  | `Tags` | `string[]` | Comma-separated labels (`series-c`, `cto-candidate`, `ai-safety`, etc.) |
  | `Notes` | `string` | Executive context, commitments, next steps, or reservations |

---

## 4. Required System Outputs

1. **Top 3–5 People to Invest in This Week**: Ranked by deterministic composite score (Goal Alignment + Actionability + Relationship Leverage). Each entry contains:
   - Identity & affiliation
   - Strategic goal alignment & score
   - Why they matter (factual history & context)
   - Specific recommended move (low-friction action)
   - Risk of CEO inaction (cost of delay)
2. **Dormant High-Leverage Relationships (2–3 People)**: Contacts with `Days since last contact >= 60`, relationship strength $\ge 2$, and strategic goal leverage, excluding cold/aspirational entries.
3. **Data Health & Failure Mode Warnings**: Explicit reporting of missing target firms, ambiguous names, thin context, and stale records.

---

## 5. Architectural Decisions & Reasoning

```
[ data/Network Roster Terragrid.xlsx ]
                 ↓
      [ TypeScript Ingestion & Zod ]
                 ↓
  [ Deterministic Intelligence Engine (src/) ]
   - Goal Classifier & Keyword/Tag Matcher
   - Composite Signal Scorer (Goal + Action + Leverage)
   - Dormancy & Anti-Aspirational Filter
   - Data Quality / Blindspot Detector
                 ↓
      [ data/latest_analysis.json ]
                 ↓
   [ Claude Code Skill (.claude/skills/) ]
   - Zero-hallucination executive synthesis
   - High-leverage phrasing & strategic brief
                 ↓
   [ Weekly Network Focus Brief (Markdown) ]
```

### Architectural Principles:
1. **Deterministic Intelligence First**: LLMs should not perform math, date sorting, or tabular scoring. Deterministic code reliably computes rankings, filters dormancy, and identifies data anomalies.
2. **Claude as Contextual Reasoner**: Claude is leveraged where it excels—synthesizing nuanced narrative context, refining executive phrasing, and presenting actionable advice.
3. **Zero Infrastructure Overhead**: No PostgreSQL, Redis, Next.js, or cloud microservices. A lightweight CLI and Claude Code Skill allow instant local execution.

---

## 6. Model & Agent Strategy

### Single Agent vs. Subagents
- **Decision**: Single Agent with Deterministic Tool Execution.
- **Reasoning**: The task is linear: parse data $\rightarrow$ compute signals $\rightarrow$ synthesize 1-page brief. Multi-agent swarms add non-deterministic orchestration overhead, latency, and failure points without improving output quality.

### Model Selection
- **Claude 3.5 Sonnet / Claude 3.7 Sonnet**: Recommended model family. Provides unmatched instruction adherence, zero-hallucination compliance, and superior executive writing capabilities.

### Claude Skill Packaging
- Packaged as a clean, standardized Claude Code Skill under `.claude/skills/weekly-network-focus/SKILL.md`.
- Invoked seamlessly via `/weekly-network-focus` in Claude Code.

---

## 7. Data Sourcing Strategy (Assessment vs. Production)

### Assessment Sourcing
- **Implementation**: Local ingestion of `data/Network Roster Terragrid.xlsx`.
- **Characteristics**: Direct source, deterministic, offline, zero external API keys required.

### Production Sourcing Architecture

```
[ Google Calendar MCP ] ──┐
[ Gmail MCP ] ──────────┼──▶ [ Central Roster DB / CRM ] ──▶ [ Deterministic Engine ] ──▶ [ Claude Skill ]
[ Attio / HubSpot CRM ] ──┤
[ Chief of Staff Notes ] ─┘
```

| Source | Role | Sync Cadence | Automation vs. Manual | Trade-offs & Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **Google Calendar MCP** | Tracks real-time meeting logs, participants, and elapsed days since last meeting. | Hourly / Daily | Fully automated | High accuracy on meeting dates, but lacks conversational nuance. |
| **Gmail MCP** | Scans inbound/outbound threads for responsive sentiment and pending commitments (e.g. "deck requested"). | Daily batch | Automated with privacy filters | High visibility into open loops; requires strict PII filtering and CEO privacy boundaries. |
| **CRM (Attio / HubSpot)** | Canonical contact store, relationship stages, investor tags, and candidate pipeline tracking. | Real-time webhook or daily sync | Hybrid (Auto-enrichment + manual updates) | Single source of truth; requires organizational hygiene to keep notes updated. |
| **Manual / Chief of Staff Entry** | Weekly scratch notes, offline meeting debriefs, and strategic rating adjustments. | Weekly before brief generation | Manual | Captures tacit knowledge and informal hallway conversations that no API can see. |

---

## 8. Failure Modes & Mitigations

| Failure Mode | Risk | Mitigation Strategy |
| :--- | :--- | :--- |
| **Goal contact missing from roster** | Hallucinating a fictional contact or making up a partnership. | Engine cross-references goal `targetEntities` (e.g. `a16z`, `MIRI`); flags missing entities as strategic blindspots. |
| **Ambiguous name match** | Conflating two contacts (e.g. David Liu vs. David Park; Jensen Huang vs. Jensen Carlsson). | Engine scans first names and full names; flags duplicates and requires full name and affiliation. |
| **Thin context** | Making unsupported executive recommendations on contacts with no notes. | Engine flags contacts with $<5$ words of notes (e.g. Anjali Sharma) and instructs operator to verify before outreach. |
| **Stale data** | Basing critical moves on outdated facts. | Engine identifies contacts with $>90$ days elapsed since contact, flagging drift warnings. |
| **Cold aspirational trap** | Wasting CEO bandwidth on famous contacts with no warmth (e.g. Jensen Huang). | Scoring suppresses strength-1 contacts with no active hook from top weekly focus. |

---

## 9. Success Criteria

1. **Executive Utility**: The CEO and Chief of Staff can complete weekly relationship planning in under 10 minutes.
2. **Factual Grounding**: 0% hallucinated contacts, claims, or conversation summaries.
3. **Dormancy Reactivation**: Identifies at least 2 high-leverage dormant relationships weekly before they go permanently cold.
4. **Usability**: Non-technical Chief of Staff can run the tool with a single command or Claude prompt.
