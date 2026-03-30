import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import { computeLeadScore } from "../utils/scoreLeads.js";
import {
  emitLeadCreated,
  emitLeadUpdated,
  emitLeadDeleted,
} from "../socket/index.js";

// Anything we emit over the socket is serialized first so clients aren't dealing with Mongoose internals.
const populateLead = [
  { path: "assignedTo", select: "name email" },
  { path: "notes.author", select: "name email" },
];

function serializeLead(doc) {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  // Recompute on the way out so "hot/warm/cold" drifts with the calendar, not the last save.
  plain.score = computeLeadScore(plain.lastContactedAt);
  return plain;
}

function invalidId(res) {
  return res.status(400).json({ message: "Invalid lead id" });
}

export async function getAllLeads(req, res) {
  try {
    const leads = await Lead.find()
      .populate(populateLead)
      .sort({ updatedAt: -1 });
    res.json(leads.map(serializeLead));
  } catch (err) {
    console.error("getAllLeads:", err);
    res.status(500).json({ message: "Could not load leads" });
  }
}

export async function getLeadById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);

    const lead = await Lead.findById(req.params.id).populate(populateLead);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(serializeLead(lead));
  } catch (err) {
    console.error("getLeadById:", err);
    res.status(500).json({ message: "Could not load lead" });
  }
}

export async function createLead(req, res) {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      followUpDate,
      assignedTo,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo user id" });
    }

    const initialStatus = status || "new";
    const payload = {
      name: name.trim(),
      email: String(email).toLowerCase().trim(),
      phone: phone?.trim() ?? "",
      company: company?.trim() ?? "",
      source: source?.trim() ?? "website",
      status: initialStatus,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      assignedTo: assignedTo || null,
    };

    if (initialStatus === "contacted") {
      payload.lastContactedAt = new Date();
    }

    const lead = await Lead.create(payload);
    await lead.populate(populateLead);

    emitLeadCreated(serializeLead(lead));
    res.status(201).json(serializeLead(lead));
  } catch (err) {
    console.error("createLead:", err);
    res.status(500).json({ message: "Could not create lead" });
  }
}

export async function updateLead(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      followUpDate,
      assignedTo,
    } = req.body;

    const prevStatus = lead.status;

    if (name !== undefined) lead.name = String(name).trim();
    if (email !== undefined) lead.email = String(email).toLowerCase().trim();
    if (phone !== undefined) lead.phone = String(phone).trim();
    if (company !== undefined) lead.company = String(company).trim();
    if (source !== undefined) lead.source = String(source).trim();
    if (followUpDate !== undefined) {
      lead.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        lead.assignedTo = null;
      } else if (!mongoose.isValidObjectId(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo user id" });
      } else {
        lead.assignedTo = assignedTo;
      }
    }

    if (status !== undefined) {
      lead.status = status;
      // First time hitting "contacted" we treat it as a touchpoint for scoring
      if (status === "contacted" && prevStatus !== "contacted") {
        lead.lastContactedAt = new Date();
      }
    }

    await lead.save();
    await lead.populate(populateLead);

    emitLeadUpdated(serializeLead(lead));
    res.json(serializeLead(lead));
  } catch (err) {
    console.error("updateLead:", err);
    res.status(500).json({ message: "Could not update lead" });
  }
}

export async function deleteLead(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const snapshot = { _id: lead._id };
    await lead.deleteOne();
    emitLeadDeleted(snapshot);
    res.json({ message: "Lead removed", ...snapshot });
  } catch (err) {
    console.error("deleteLead:", err);
    res.status(500).json({ message: "Could not delete lead" });
  }
}

export async function addNote(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);

    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.notes.push({
      text: String(text).trim(),
      author: req.user._id,
    });
    lead.lastContactedAt = new Date();
    await lead.save();
    await lead.populate(populateLead);

    emitLeadUpdated(serializeLead(lead));
    res.status(201).json(serializeLead(lead));
  } catch (err) {
    console.error("addNote:", err);
    res.status(500).json({ message: "Could not add note" });
  }
}
