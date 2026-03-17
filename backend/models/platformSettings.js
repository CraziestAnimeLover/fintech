import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema({
  defaultMDR: { type: Number, default: 2 },        // MDR % for transactions
  agentDefaultRate: { type: Number, default: 50 }, // default % of MDR agents get
}, { timestamps: true });

export default mongoose.model("PlatformSettings", platformSettingsSchema);