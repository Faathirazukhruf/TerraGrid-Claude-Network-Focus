import * as path from 'path';
import * as fs from 'fs';
import { analyzeRoster } from './analyzer.js';

function main() {
  const args = process.argv.slice(2);
  let filePath = path.resolve(process.cwd(), 'data', 'Network Roster Terragrid.xlsx');
  let jsonOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
      jsonOnly = true;
    } else if (!args[i].startsWith('--')) {
      filePath = path.resolve(process.cwd(), args[i]);
    }
  }

  try {
    const result = analyzeRoster(filePath);

    // Save intermediate JSON artifact
    const outputPath = path.resolve(process.cwd(), 'data', 'latest_analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    if (jsonOnly) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log('================================================================');
    console.log('           TERRAGRID WEEKLY NETWORK FOCUS ANALYSIS             ');
    console.log('================================================================');
    console.log(`Source File: ${result.sourceFile}`);
    console.log(`Total Contacts Analyzed: ${result.totalContacts}`);
    console.log(`Generated At: ${result.generatedAt}\n`);

    console.log('----------------------------------------------------------------');
    console.log('1. TOP 3-5 PEOPLE TO INVEST IN THIS WEEK');
    console.log('----------------------------------------------------------------');
    result.topWeeklyFocus.forEach((item, idx) => {
      const c = item.contact;
      const s = item.scoring;
      const primaryGoal = s.matchedGoals[0]?.goalTitle || 'General Strategy';
      console.log(`\n[${idx + 1}] ${c.name} - ${c.role}, ${c.company}`);
      console.log(`    Goal Alignment: ${primaryGoal} (Score: ${s.compositeScore}/100)`);
      console.log(`    Why They Matter: ${s.priorityReasons.join('; ')}`);
      console.log(`    Recommended Move: ${s.recommendedMove}`);
      console.log(`    Risk of Inaction: ${s.riskIfIgnored}`);
    });

    console.log('\n----------------------------------------------------------------');
    console.log('2. DORMANT HIGH-LEVERAGE RELATIONSHIPS (60+ Days Since Contact)');
    console.log('----------------------------------------------------------------');
    result.dormantHighLeverage.forEach((item, idx) => {
      const c = item.contact;
      const s = item.scoring;
      console.log(`\n[${idx + 1}] ${c.name} - ${c.role}, ${c.company} (Strength: ${c.relationshipStrength}/5)`);
      console.log(`    Last Contact: ${c.daysSinceLastContact} days ago via ${c.lastContactChannel}`);
      console.log(`    Leverage Context: ${s.dormancyReasons.join('; ')}`);
      console.log(`    Recommended Move: ${s.recommendedMove}`);
      console.log(`    Risk of Inaction: ${s.riskIfIgnored}`);
    });

    console.log('\n----------------------------------------------------------------');
    console.log('3. DATA QUALITY & FAILURE MODE ALERTS');
    console.log('----------------------------------------------------------------');
    if (result.qualityFlags.missingGoalContacts.length > 0) {
      console.log('\n[MISSING GOAL TARGETS]');
      result.qualityFlags.missingGoalContacts.forEach(m => {
        console.log(`  * ${m.missingEntity} (${m.goalTitle}): ${m.rationale}`);
      });
    }

    if (result.qualityFlags.ambiguousNames.length > 0) {
      console.log('\n[AMBIGUOUS NAME MATCHES]');
      result.qualityFlags.ambiguousNames.forEach(a => {
        console.log(`  * ${a.name}: ${a.details}`);
      });
    }

    if (result.qualityFlags.thinContextContacts.length > 0) {
      console.log('\n[THIN CONTEXT WARNINGS]');
      result.qualityFlags.thinContextContacts.forEach(t => {
        console.log(`  * ${t.name}: ${t.issues.join(', ')}`);
      });
    }

    if (result.qualityFlags.staleContacts.length > 0) {
      console.log('\n[STALE CONTACTS (>90 Days)]');
      result.qualityFlags.staleContacts.forEach(st => {
        console.log(`  * ${st.name} (${st.daysSinceLastContact}d): ${st.warning}`);
      });
    }

    console.log('\n================================================================');
    console.log(`Intermediate structured data written to: ${outputPath}`);
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('Error analyzing roster:', err.message);
    process.exit(1);
  }
}

main();
