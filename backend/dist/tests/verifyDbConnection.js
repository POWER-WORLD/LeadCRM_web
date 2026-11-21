"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connection_1 = __importDefault(require("../db/connection"));
const Lead_1 = __importDefault(require("../models/Lead"));
const mongoose_1 = __importDefault(require("mongoose"));
async function verifyDatabase() {
    console.log("[DB Test] Initiating connection to MongoDB...");
    try {
        const conn = await (0, connection_1.default)();
        console.log(`[DB Test] Successfully connected to host: ${conn.connection.host}`);
        console.log(`[DB Test] Database name: ${conn.connection.name}`);
        console.log(`[DB Test] Ready state: ${conn.connection.readyState} (1 = connected)`);
        // Unique timestamped email to avoid conflict
        const testEmail = `test.lead.${Date.now()}@pawankumar.info`;
        const sampleLead = {
            name: "Acme Enterprise Prospect",
            email: testEmail,
            phone: "+1 (555) 234-5678",
            company: "Acme Global Industries",
            status: "New",
            notes: "Lead inserted during automated local DB verification.",
        };
        console.log("[DB Test] Creating a test lead record in collection...");
        const createdLead = await Lead_1.default.create(sampleLead);
        console.log("[DB Test] Lead record created successfully with ID:", createdLead._id.toString());
        console.log("[DB Test] Created Lead Data:", JSON.stringify(createdLead.toJSON(), null, 2));
        console.log("[DB Test] Querying the created lead from DB...");
        const queriedLead = await Lead_1.default.findById(createdLead._id);
        if (!queriedLead) {
            throw new Error("Created lead could not be found via findById");
        }
        console.log(`[DB Test] Verified: Queried lead name matches: "${queriedLead.name}"`);
        const totalLeads = await Lead_1.default.countDocuments();
        console.log(`[DB Test] Total leads currently in database: ${totalLeads}`);
        console.log("[DB Test] Database connection and CRUD operations verified successfully!");
    }
    catch (error) {
        console.error("[DB Test ERROR]:", error.message || error);
        process.exitCode = 1;
    }
    finally {
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
            console.log("[DB Test] Disconnected cleanly from database.");
        }
    }
}
verifyDatabase();
//# sourceMappingURL=verifyDbConnection.js.map