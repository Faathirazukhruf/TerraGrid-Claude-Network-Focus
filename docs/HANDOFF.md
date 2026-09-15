# 🤝 Operator Handoff Document
## TerraGrid Weekly Network Focus (Chief of Staff Guide)

**Prepared for**: Chief of Staff / Executive Assistant / Operations Lead  
**Document Horizon**: 1-Page Plain-Language Operational Manual  

---

## 1. Prerequisites
- **Node.js** (v18 or higher installed on your computer).
- **Claude Code** (or terminal access).
- Your latest network roster spreadsheet saved as:  
  `data/Network Roster Terragrid.xlsx`

---

## 2. Installation (One-Time Setup)
Open your terminal in the project directory and run:
```bash
npm install
```
That's it! No databases, servers, or background services need to be configured.

---

## 3. How to Run

### Option A: Via Claude Code Skill (Recommended)
Inside your Claude Code session, simply type:
```text
/weekly-network-focus
```
Claude will automatically execute the deterministic scoring engine, review the data, and print your formatted 1-page executive brief.

### Option B: Direct Terminal Preview
If you want to view the raw deterministic rankings instantly in the terminal:
```bash
npm run analyze
```

---

## 4. Key Use Cases

### Use Case 1: Monday Morning CEO Network Briefing
- **Scenario**: Every Monday at 8:30 AM, the Chief of Staff prepares a 10-minute relationship agenda for the CEO’s 1:1.
- **Workflow**: The Chief of Staff drops the updated `Network Roster Terragrid.xlsx` into `data/`, runs `/weekly-network-focus`, and pastes the 1-page output into the CEO's Notion briefing doc.
- **Result**: The CEO immediately knows which 3-5 people to contact and which dormant champion to reactivate.

### Use Case 2: Mid-Quarter Board & Investor Round Prep
- **Scenario**: TerraGrid is 4 weeks away from kicking off the Series C fundraise and needs to ensure all lead signaling partners are warm.
- **Workflow**: Run `npm run analyze`. The Chief of Staff immediately reviews the **Dormant Relationships** and **Missing Targets** sections.
- **Result**: Surfaces that Reid Hoffman (Greylock) has been quiet for 81 days and a16z is missing, allowing the team to request an intro before launching the round.

---

## 5. Sample Input vs. Expected Output

### Sample Input (`data/Network Roster Terragrid.xlsx`)
| Name | Role | Company | Days Ago | Strength | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Marcus Wei | Partner | Sequoia Capital | 16 | 3 | Replied positively to teaser deck; asked to see full pitch. |
| Reid Hoffman | Partner | Greylock | 81 | 4 | Pre-seed investor. Expressed interest in Series C plans at CES. |
| James Park | Physician | UCSF | 3 | 5 | Best friend since college. No business overlap. |

### Expected Output
1. **Top Priority**: **Marcus Wei (Sequoia)** is ranked #1 because he requested the pitch deck (high goal relevance + immediate actionability).
2. **Dormant Focus**: **Reid Hoffman (Greylock)** is flagged for reactivation (81 days silent + high pre-seed leverage).
3. **Smart Filtering**: **James Park (Physician)** is automatically excluded from business priorities despite high relationship strength (5/5), preventing wasted executive time.

---

## 6. Troubleshooting & Common Questions

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **"Roster file not found"** | The Excel file is missing or misnamed. | Verify that the file exists at `data/Network Roster Terragrid.xlsx`. |
| **"Worksheet is empty"** | The Excel file has no rows or headers. | Open Excel and confirm sheet 1 has data with standard headers. |
| **A famous contact doesn't appear in Top Focus** | The system deliberately filters out cold aspirational contacts (e.g. met once at a conference). | Focus CEO time on high-trust relationships with active conversational momentum. |
| **How do I change quarterly goals?** | Goals change each quarter. | Edit `src/goals.ts` with new targets, run `npm run build`, and re-run the brief. |
