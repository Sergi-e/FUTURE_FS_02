import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Lead from "../models/Lead.js";
import { computeLeadScore } from "../utils/scoreLeads.js";

function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/** Demo rows: varied names, emails, sources, stages, deal values ($500-$5000), createdAt spread for weekly chart. */
function buildDemoDocuments() {
  const specs = [
    {
      name: "Marcus Chen",
      email: "marcus.chen@northpeak.io",
      phone: "+1 (415) 555-0198",
      company: "NorthPeak Analytics",
      source: "Website",
      status: "new",
      dealValue: 3200,
      createdDaysAgo: 52,
      lastContactedDaysAgo: null,
    },
    {
      name: "Amara Diallo",
      email: "amara.diallo@riverside.tech",
      phone: "+221 33 821 4402",
      company: "Riverside Labs",
      source: "Referral",
      status: "new",
      dealValue: 2850,
      createdDaysAgo: 41,
      lastContactedDaysAgo: null,
    },
    {
      name: "Priya Patel",
      email: "priya.patel@brightwave.co",
      phone: "+91 22 4892 1100",
      company: "Brightwave Media",
      source: "LinkedIn",
      status: "contacted",
      dealValue: 2100,
      createdDaysAgo: 34,
      lastContactedDaysAgo: 3,
    },
    {
      name: "David Nguyen",
      email: "david.nguyen@pacificlabs.io",
      phone: "+1 (510) 555-0144",
      company: "Pacific Labs",
      source: "Cold Outreach",
      status: "contacted",
      dealValue: 850,
      createdDaysAgo: 27,
      lastContactedDaysAgo: 6,
    },
    {
      name: "Elena Vasquez",
      email: "elena.vasquez@steelcrest.com",
      phone: "+34 912 447 889",
      company: "Steelcrest Holdings",
      source: "Event",
      status: "qualified",
      dealValue: 4650,
      createdDaysAgo: 20,
      lastContactedDaysAgo: 11,
    },
    {
      name: "James Okonkwo",
      email: "james.okonkwo@urbanfiber.net",
      phone: "+234 803 555 9021",
      company: "UrbanFiber Net",
      source: "Website",
      status: "converted",
      dealValue: 1950,
      createdDaysAgo: 13,
      lastContactedDaysAgo: 12,
    },
    {
      name: "Sofia Andersson",
      email: "sofia.andersson@nordlicht.se",
      phone: "+46 8 551 720 31",
      company: "Nordlicht AB",
      source: "Referral",
      status: "lost",
      dealValue: 3320,
      createdDaysAgo: 5,
      lastContactedDaysAgo: 18,
    },
  ];

  return specs.map((s) => {
    const createdAt = daysAgo(s.createdDaysAgo);
    const lastContactedAt =
      s.lastContactedDaysAgo != null ? daysAgo(s.lastContactedDaysAgo) : null;
    return {
      name: s.name,
      email: s.email.toLowerCase(),
      phone: s.phone,
      company: s.company,
      source: s.source,
      status: s.status,
      score: computeLeadScore(lastContactedAt),
      notes: [],
      followUpDate: null,
      dealValue: s.dealValue,
      lastContactedAt,
      assignedTo: null,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

/**
 * Inserts realistic demo leads when the workspace has none (fresh MongoDB).
 * Uses native collection insert so createdAt spreads across weeks for analytics.
 */
export async function seedDemoLeadsIfEmpty() {
  const existing = await Lead.countDocuments();
  if (existing > 0) return;

  const docs = buildDemoDocuments();
  await Lead.collection.insertMany(docs);
  console.log(`Demo data: seeded ${docs.length} sample leads (empty database).`);
}

/** CLI: node scripts/seedDemoLeads.js loads root .env via server/loadEnv pattern. */
async function main() {
  await import("../loadEnv.js");
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI");
    process.exit(1);
  }
  await mongoose.connect(uri);
  try {
    await seedDemoLeadsIfEmpty();
  } finally {
    await mongoose.disconnect();
  }
}

function isExecutedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(entry);
  } catch {
    return false;
  }
}

if (isExecutedDirectly()) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
