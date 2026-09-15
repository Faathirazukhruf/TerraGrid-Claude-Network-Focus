import { Contact, GoalMatch, ContactScoring, ScoredContact, StrategicGoal } from './types.js';
export declare function matchGoals(contact: Contact, goals?: StrategicGoal[]): GoalMatch[];
export declare function calculateScores(contact: Contact): ContactScoring;
export declare function scoreAllContacts(contacts: Contact[]): ScoredContact[];
