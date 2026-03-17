import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { genSalt, hash, compare } = bcrypt;

const userSchema = new Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  password: {
    type: String,
    minlength: 6,
    select: false,
    required: function () {
      return this.provider === "local";
    }
  },

  role: {
    type: String,
    enum: ["user", "admin", "agent"],
    default: "user"
  },

  agent: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    code: String,
    expiresAt: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  // ----------------------
  // KYC Documents
  // ----------------------
  documents: {
    pan: { url: String, uploadedAt: Date },
    aadhaar: { url: String, uploadedAt: Date },
    gst: { url: String, uploadedAt: Date },
    cin: { url: String, uploadedAt: Date },
    incorporation: { url: String, uploadedAt: Date },
    bank_proof: { url: String, uploadedAt: Date },
    udyam: { url: String, uploadedAt: Date },
    board_resolution: { url: String, uploadedAt: Date },
    moa: { url: String, uploadedAt: Date },
    llp_agreement: { url: String, uploadedAt: Date }
  },

  status: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected"],
    default: "not_submitted"
  },

  adminRemark: String,

  kycSubmittedAt: Date,
  kycVerifiedAt: Date,

  // ----------------------
  // Commercial Settings
  // ----------------------
  commercial: {
    payin: { type: Number, default: 0 },
    payout: { type: Number, default: 0 },
    mdr: { type: Number, default: 0 },
    transactionFee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },

    bankName: String,
    accountHolder: String,
    accountNumber: {
      type: String,
      select: false
    },
    ifsc: String,
    branch: String,

    settlementType: String,
    minSettlement: { type: Number, default: 0 }
  },

  // ----------------------
  // Company Info
  // ----------------------
  company: {
    name: String,

    type: {
      type: String,
      enum: ["Private Ltd", "LLP", "Sole Proprietor", "Partnership"]
    },

    industry: String,

    website: String,

    description: String,

    address: {
      country: String,
      state: String,
      city: String,
      postalCode: String,
      fullAddress: String
    },

    registration: {
      cin: String,
      gst: String,
      pan: String,
      incorporationDate: Date
    }
  }

});


// Hash password
userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});


// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};


// JWT
userSchema.methods.getSignedJwtToken = function () {

  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

};


// OTP
userSchema.methods.generateOtp = async function () {

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };

  await this.save();

  return otp;
};


export default model("User", userSchema);