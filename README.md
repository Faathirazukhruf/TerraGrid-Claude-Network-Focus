# 🌐 TerraGrid Weekly Network Focus Intelligence Engine & Claude Skill

> **Final AI Builder Partner Assessment Deliverable**  
> A production-minded, explainable relationship intelligence engine and Claude Code Skill that helps TerraGrid's Chief of Staff prioritize executive network relationships aligned with quarterly company goals.

---

## 📖 Overview

TerraGrid is a 50-person SaaS company pursuing three ambitious quarterly objectives:
1. **Series C Fundraise**: Raise $40M at a $200M valuation (engaging Sequoia, a16z, Greylock, Index, etc.).
2. **CTO Hire**: Recruit an executive with proven experience scaling engineering from 50 to 200+ engineers.
3. **AI Safety Relationships**: Build deep partnerships across research institutes, organizations, and academia (Anthropic, ARC Evals, MIRI, EA Global, Stanford/MIT CSAIL).

Instead of letting the CEO spend time reactively on whoever is on her calendar or cold famous luminaries, this system executes **deterministic scoring** and **contextual Claude synthesis** to produce a weekly 1-page executive brief.

---

## 🏛️ Architecture

```
                       [ Network Roster Spreadsheet (.xlsx) ]
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │       XLSX Ingestion & Validator       │
                     │         (Zod Schema & Parser)          │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │    Deterministic Intelligence Engine   │
                     │  - Goal Classifier (Keywords & Tags)   │
                     │  - Actionability & Momentum Scorer     │
                     │  - Relationship Leverage Scorer        │
                     │  - Dormancy Filter (60+ days & power)  │
                     │  - Failure Mode & Blindspot Detector   │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │    Structured Intermediate Payload     │
                     │      (data/latest_analysis.json)       │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │           Claude Code Skill            │
                     │  (.claude/skills/weekly-network-focus) │
                     │  - Zero-hallucination guardrails       │
                     │  - Executive recommendation synthesis  │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │      Weekly Network Focus Brief        │
                     │      (1-Page Markdown Document)        │
                     └────────────────────────────────────────┘
```

---

## ⚡ Key Features & Explainable Scoring

- **Deterministic Core**: Math, sorting, recency calculations, and quality checks are executed in TypeScript to eliminate AI calculation errors and hallucinations.
- **Explainable Multi-Signal Scoring**:
  $$\text{Composite Score} = 0.45 \times \text{Goal Alignment} + 0.35 \times \text{Actionability} + 0.20 \times \text{Relationship Leverage}$$
- **Anti-Aspirational Filter**: Precludes cold famous names (e.g. Jensen Huang met once with strength 1) from diluting the top focus.
- **Smart Dormancy Detection**: Detects champions with 60+ days of silence who possess high strategic value (e.g., pre-seed investor Reid Hoffman).
- **Automated Failure-Mode & Data Quality Flagging**:
  1. *Missing Goal Contacts*: Detects unrepresented target entities (e.g., a16z, MIRI).
  2. *Ambiguous Name Matches*: Detects shared first names (e.g. David Liu vs. David Park) to prevent cross-wiring notes.
  3. *Thin Context*: Warns on entries with $<5$ words of context (e.g., Anjali Sharma).
  4. *Stale Data*: Identifies contacts with $>90$ days elapsed without fresh touchpoints.

---

## 📦 Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- [npm](https://www.npmjs.com/) (version 9.0.0 or higher)
- [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)

### Installation
Clone the repository and install the lightweight dependencies:
```bash
git clone https://github.com/your-org/TerraGrid-Claude-Network-Focus.git
cd TerraGrid-Claude-Network-Focus
npm install
```

---

## 🚀 How to Run

### 1. Ingesting the Roster Spreadsheet
Place your roster Excel file at:
```
data/Network Roster Terragrid.xlsx
```
*(The repository already includes the full 25-contact TerraGrid roster).*

### 2. Running the Claude Code Skill
Inside Claude Code, simply run:
```text
/weekly-network-focus
```
Claude will execute the deterministic analysis, inspect `data/latest_analysis.json`, and print the complete 1-page executive brief.

### 3. Direct CLI Execution (Terminal Mode)
To run the deterministic intelligence engine directly in your terminal:
```bash
npm run analyze
```
To output raw JSON:
```bash
npm run analyze -- --json
```

### 4. Running Automated Tests
To run the comprehensive test suite covering scoring, dormancy, failure modes, and end-to-end roster processing:
```bash
npm test
```

---

## 📊 Sample Output Preview

```text
================================================================
           TERRAGRID WEEKLY NETWORK FOCUS ANALYSIS             
================================================================
Source File: data/Network Roster Terragrid.xlsx
Total Contacts Analyzed: 25

1. TOP 3-5 PEOPLE TO INVEST IN THIS WEEK:
   [1] Marcus Wei - Partner, Sequoia Capital (Score: 94/100)
       - Goal: Raise Series C by end of Q3
       - Move: Send full pitch deck and schedule 30-min deep-dive.
       - Risk: Sequoia allocates Q3 lead bandwidth to competitors.
   [2] Diana Chen - CTO, Stripe (Score: 93/100)
       - Goal: Hire CTO
       - Move: Follow up thanking her and request 3-4 candidate intros.
   [3] Maya Patel - VP Engineering, Slack (Score: 93/100)
       - Goal: Hire CTO
       - Move: Re-engage 1-month follow-up window for CTO search.
   [4] Paul Christiano - Researcher, ARC Evals (Score: 83/100)
       - Goal: Build AI Safety Relationships
       - Move: Send concrete evaluation questions for collaboration.
   [5] David Liu - Senior Engineering Manager, Google (Score: 83/100)
       - Goal: Hire CTO (Scaling 50-to-200 org)

2. DORMANT HIGH-LEVERAGE RELATIONSHIPS (60+ Days):
   [1] Reid Hoffman - Partner, Greylock (81 days silent | Strength: 4/5)
       - Context: Pre-seed investor, key round signaling partner.
   [2] Priya Mehta - Partner, Index Ventures (128 days silent | Strength: 2/5)
       - Context: Seed round coffee, tier-1 SaaS syndicate fit.

3. DATA QUALITY & FAILURE MODE ALERTS:
   * Missing Goal Targets: a16z, MIRI, Stanford CSAIL.
   * Ambiguous Names: Shared first name 'David' (David Liu vs David Park).
   * Thin Context: Anjali Sharma (lacks follow-up depth).
   * Stale Records (>90d): Jensen Huang (199d), Priya Mehta (128d), Demis Hassabis (103d).
```

---

## 📂 Repository Structure

```
TerraGrid-Claude-Network-Focus/
├── .claude/
│   └── skills/
│       └── weekly-network-focus/
│           └── SKILL.md                 # Claude Code Skill definition
├── data/
│   ├── Network Roster Terragrid.xlsx    # Source roster spreadsheet (25 contacts)
│   └── latest_analysis.json            # Deterministic intermediate payload
├── docs/
│   ├── WEEKLY_NETWORK_FOCUS_BRIEF.md    # Formatted 1-page weekly executive brief
│   ├── PRD.md                           # Comprehensive 2-page Product Requirements Document
│   └── HANDOFF.md                       # Non-technical operator manual
├── src/
│   ├── types.ts                         # Zod schemas and TypeScript interfaces
│   ├── goals.ts                         # TerraGrid quarterly goals and criteria
│   ├── parser.ts                        # Robust Excel sheet parser & normalizer
│   ├── scoring.ts                       # Deterministic scoring and dormancy logic
│   ├── quality.ts                       # Failure mode & data quality detector
│   ├── analyzer.ts                      # Main orchestration pipeline
│   ├── cli.ts                           # Terminal CLI entry point
│   └── index.ts                         # Module exports
├── tests/
│   ├── scoring.test.ts                  # Goal matching & priority scoring tests
│   ├── dormancy.test.ts                 # Dormancy & anti-aspirational filter tests
│   ├── quality.test.ts                  # Failure modes (missing/ambiguous/thin/stale) tests
│   └── e2e.test.ts                      # End-to-end test on the actual TerraGrid roster
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Troubleshooting & Limitations

### Common Issues
1. **File Path Error**: If the tool reports `Roster file not found`, ensure your file is named `Network Roster Terragrid.xlsx` and placed in the `data/` folder.
2. **Missing Columns**: If your spreadsheet uses custom column names, `src/parser.ts` handles variations (e.g. `Relationship Strength (1-5)` vs `Strength`), but requires standard concepts (`Name`, `Role`, `Company`, `Notes`).

### Known Limitations & Production Roadmap
- **Manual Spreadsheet Updates**: The assessment relies on a local Excel file. In production, real-time sync with Google Calendar MCP and Gmail MCP will automatically update `daysSinceLastContact` and sentiment without manual spreadsheet entry.
- **Static Goal Weighting**: Quarterly goal weights are currently tuned in `src/goals.ts`. Future releases will allow setting goal weights interactively via Claude prompt.
