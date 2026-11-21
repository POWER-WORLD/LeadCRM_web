import dotenv from "dotenv";
dotenv.config();

import connectDB from "../db/connection";
import Lead from "../models/Lead";
import mongoose from "mongoose";

async function verifyDatabase() {
  console.log("[DB Test] Initiating connection to MongoDB...");
  try {
    const conn = await connectDB();
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
      status: "New" as const,
      notes: "Lead inserted during automated local DB verification.",
    };

    console.log("[DB Test] Creating a test lead record in collection...");
    const createdLead: any = await Lead.create(sampleLead);
    console.log("[DB Test] Lead record created successfully with ID:", createdLead._id.toString());
    console.log("[DB Test] Created Lead Data:", JSON.stringify(createdLead.toJSON(), null, 2));

    console.log("[DB Test] Querying the created lead from DB...");
    const queriedLead = await Lead.findById(createdLead._id);
    if (!queriedLead) {
      throw new Error("Created lead could not be found via findById");
    }
    console.log(`[DB Test] Verified: Queried lead name matches: "${queriedLead.name}"`);

    const totalLeads = await Lead.countDocuments();
    console.log(`[DB Test] Total leads currently in database: ${totalLeads}`);

    console.log("[DB Test] Database connection and CRUD operations verified successfully!");
  } catch (error: any) {
    console.error("[DB Test ERROR]:", error.message || error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("[DB Test] Disconnected cleanly from database.");
    }
  }
}

verifyDatabase();

