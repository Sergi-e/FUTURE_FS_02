import mongoose from "mongoose";
import { computeLeadScore } from "../utils/scoreLeads.js";

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    source: { type: String, default: "website", trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },
    score: {
      type: String,
      enum: ["hot", "warm", "cold"],
      default: "cold",
    },
    notes: [noteSchema],
    followUpDate: { type: Date, default: null },
    // Used for hot/warm/cold — we bump this on real touchpoints (notes, status → contacted, etc.)
    lastContactedAt: { type: Date, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

leadSchema.pre("save", function (next) {
  this.score = computeLeadScore(this.lastContactedAt);
  next();
});

export default mongoose.model("Lead", leadSchema);
