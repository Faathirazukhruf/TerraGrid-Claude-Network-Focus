import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { Contact, ContactSchema } from './types.js';

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function parseRosterFile(filePath: string): Contact[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Roster file not found at path: "${filePath}". Please ensure the XLSX file is placed correctly.`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(`The workbook in "${filePath}" contains no worksheets.`);
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error(`Worksheet "${sheetName}" is empty.`);
  }

  const contacts: Contact[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const normalizedRow: Record<string, any> = {};

    for (const [key, value] of Object.entries(rawRow)) {
      normalizedRow[normalizeKey(key)] = value;
    }

    // Extract name
    const name = String(normalizedRow['name'] || '').trim();
    if (!name) {
      // Skip empty row
      continue;
    }

    const role = String(normalizedRow['role'] || '').trim();
    const company = String(normalizedRow['company'] || '').trim();
    const howSheKnowsThem = String(
      normalizedRow['howsheknowsthem'] || normalizedRow['howknowsthem'] || normalizedRow['relationship'] || ''
    ).trim();

    const daysRaw = normalizedRow['dayssincelastcontact'] ?? normalizedRow['dayslastcontact'] ?? normalizedRow['dayssincecontact'];
    const daysSinceLastContact = typeof daysRaw === 'number' ? daysRaw : parseInt(String(daysRaw || '0'), 10) || 0;

    const lastContactChannel = String(
      normalizedRow['lastcontactchannel'] || normalizedRow['channel'] || ''
    ).trim();

    const lastContactSummary = String(
      normalizedRow['lastcontactsummary'] || normalizedRow['summary'] || ''
    ).trim();

    const relStrengthRaw =
      normalizedRow['relationshipstrength15'] ??
      normalizedRow['relationshipstrength'] ??
      normalizedRow['strength'];
    let relationshipStrength = typeof relStrengthRaw === 'number' ? relStrengthRaw : parseInt(String(relStrengthRaw || '1'), 10) || 1;
    if (relationshipStrength < 1) relationshipStrength = 1;
    if (relationshipStrength > 5) relationshipStrength = 5;

    const rawTags = normalizedRow['tags'] ?? '';
    let tags: string[] = [];
    if (Array.isArray(rawTags)) {
      tags = rawTags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
    } else if (typeof rawTags === 'string') {
      tags = rawTags
        .split(/[,;]+/)
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const notes = String(normalizedRow['notes'] || normalizedRow['note'] || '').trim();

    const contactData = {
      name,
      role,
      company,
      howSheKnowsThem,
      daysSinceLastContact,
      lastContactChannel,
      lastContactSummary,
      relationshipStrength,
      tags,
      notes,
      rawRow: i + 2 // 1-indexed, accounting for header row
    };

    const validated = ContactSchema.parse(contactData);
    contacts.push(validated);
  }

  return contacts;
}
