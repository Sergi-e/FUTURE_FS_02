import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    // "type" clashes with Mongoose's reserved key unless written this way
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
