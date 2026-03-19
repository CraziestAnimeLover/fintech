import { Schema, model } from "mongoose";

const bankAccountSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  bankName: {
    type: String,
    required: true,
    trim: true
  },

  accountHolder: {
    type: String,
    required: true,
    trim: true
  },

  accountNumber: {
    type: String,
    required: true,
    select: false // 🔒 hidden by default
  },

  ifsc: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  branch: {
    type: String,
    trim: true
  },

  // 🔥 NEW (IMPORTANT)
  isVerified: {
    type: Boolean,
    default: false
  },

  verifiedAt: {
    type: Date
  },

  verifiedName: {
    type: String // name returned from API
  },

  // ✅ Default bank
  isDefault: {
    type: Boolean,
    default: false
  },

  // 🔐 Soft delete (optional but pro)
  isActive: {
    type: Boolean,
    default: true
  }

},
{
  timestamps: true
});

export const BankAccount = model("BankAccount", bankAccountSchema);