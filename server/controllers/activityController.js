import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import { emitActivityNew } from "../socket/index.js";

const populateActivity = [
  { path: "userId", select: "name email" },
  { path: "leadId", select: "name email company status" },
];

function serializeActivity(doc) {
  return doc.toObject ? doc.toObject() : { ...doc };
}

export async function getActivities(req, res) {
  try {
    const filter = {};
    const { leadId } = req.query;
    if (leadId) {
      if (!mongoose.isValidObjectId(leadId)) {
        return res.status(400).json({ message: "Invalid leadId query" });
      }
      filter.leadId = leadId;
    }

    const items = await Activity.find(filter)
      .populate(populateActivity)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(items.map(serializeActivity));
  } catch (err) {
    console.error("getActivities:", err);
    res.status(500).json({ message: "Could not load activities" });
  }
}

export async function createActivity(req, res) {
  try {
    const { type, message, leadId } = req.body;

    if (!type || !message || !leadId) {
      return res.status(400).json({ message: "type, message, and leadId are required" });
    }
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ message: "Invalid leadId" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const row = await Activity.create({
      type: String(type).trim(),
      message: String(message).trim(),
      leadId,
      userId: req.user._id,
    });

    await row.populate(populateActivity);
    const out = serializeActivity(row);
    emitActivityNew(out);
    res.status(201).json(out);
  } catch (err) {
    console.error("createActivity:", err);
    res.status(500).json({ message: "Could not log activity" });
  }
}
