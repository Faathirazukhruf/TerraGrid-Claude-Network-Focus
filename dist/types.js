"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSchema = void 0;
const zod_1 = require("zod");
exports.ContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    role: zod_1.z.string().default(''),
    company: zod_1.z.string().default(''),
    howSheKnowsThem: zod_1.z.string().default(''),
    daysSinceLastContact: zod_1.z.number().int().nonnegative().default(0),
    lastContactChannel: zod_1.z.string().default(''),
    lastContactSummary: zod_1.z.string().default(''),
    relationshipStrength: zod_1.z.number().min(1).max(5).default(1),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.string().default(''),
    rawRow: zod_1.z.number().int().default(0)
});
//# sourceMappingURL=types.js.map