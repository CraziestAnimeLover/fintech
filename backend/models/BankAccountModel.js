import { Schema, model } from "mongoose";

const bankAccountSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bankName: {
    type: String,
    required: true
  },

  accountHolder: {
    type: String,
    required: true
  },

  accountNumber: {
    type: String,
    required: true,
    select: true   // hidden by default for security
  },

  ifsc: {
    type: String,
    required: true
  },

  branch: {
    type: String
  },

  isDefault: {
    type: Boolean,
    default: false
  }

},
{
  timestamps: true
});

export const BankAccount = model("BankAccount", bankAccountSchema);