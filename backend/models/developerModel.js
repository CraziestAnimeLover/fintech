import mongoose from "mongoose";

const DeveloperSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: { type: String },
  token: { type: String, required: true, unique: true },
  secret: { type: String, required: true, unique: true },
  callback: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Developer = mongoose.model("Developer", DeveloperSchema);