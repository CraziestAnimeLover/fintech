import User from "../models/User.js";
import Commission from "../models/commissionModel.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export async function getUsers(req, res) {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error getting users"
    });
  }
}


// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error getting user"
    });
  }
}


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export async function updateProfile(req, res) {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
}


// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
export async function updatePassword(req, res) {
  try {

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password updated successfully");

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating password"
    });
  }
}


// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export async function deleteUser(req, res) {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting user"
    });
  }
}


// Helper function
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    message,
    token
  });
};



export const createUser = async (req, res) => {
  try {

    const { name, email, password, role ,agentId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

  const user = await User.create({
  name,
  email,
  phone,
  password,
  role: "user",
  agent: agentId
});

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {

    console.error("CREATE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createCompany = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    user.company = req.body;

    await user.save();

    res.json({
      success: true,
      data: user.company
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getCompany = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user.company || {}
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateCompany = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // normalize input
    const company = {
      name: req.body.name || user.company?.name || "",
      type: req.body.type || user.company?.type || "",
      industry: req.body.industry || user.company?.industry || "",
      website: req.body.website || user.company?.website || "",
      description: req.body.description || user.company?.description || "",
      address: {
        country: req.body.address?.country || user.company?.address?.country || "",
        state: req.body.address?.state || user.company?.address?.state || "",
        city: req.body.address?.city || user.company?.address?.city || "",
        postalCode: req.body.address?.postalCode || user.company?.address?.postalCode || "",
        fullAddress: req.body.address?.fullAddress || user.company?.address?.fullAddress || ""
      },
      registration: {
        cin: req.body.registration?.cin || user.company?.registration?.cin || "",
        gst: req.body.registration?.gst || user.company?.registration?.gst || "",
        pan: req.body.registration?.pan || user.company?.registration?.pan || "",
        incorporationDate: req.body.registration?.incorporationDate || user.company?.registration?.incorporationDate || null
      }
    };

    user.company = company;
    await user.save();

    res.json({ success: true, data: user.company });

  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------
// Get Commercial
// ----------------------
export const getCommercial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure commercial object exists and has an _id
    let commercial = user.commercial || {};
    if (!commercial._id) {
      commercial._id = user._id; // fallback if not set
    }

    res.json({
      success: true,
      data: commercial
    });
  } catch (err) {
    console.error("Get commercial error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------
// Create Commercial
// ----------------------
export const createCommercial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Initialize commercial subdocument if missing
    if (!user.commercial) {
      user.commercial = {};
    }

    // Numeric fields
    const numericFields = ["payin", "payout", "mdr", "transactionFee", "commission", "minSettlement"];
    numericFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (isNaN(req.body[field])) {
          throw new Error(`${field} must be a number`);
        }
        user.commercial[field] = Number(req.body[field]);
      }
    });

    // String fields
    const stringFields = ["bankName", "accountHolder", "accountNumber", "ifsc", "branch", "settlementType"];
    stringFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user.commercial[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      data: user.commercial
    });
  } catch (err) {
    console.error("Create commercial error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// ----------------------
// Update Commercial
// ----------------------
export const updateCommercial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Ensure commercial subdocument exists
    if (!user.commercial) {
      user.commercial = {};
    }

    // Update numeric fields
    const numericFields = ["payin", "payout", "mdr", "transactionFee", "commission", "minSettlement"];
    numericFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (isNaN(req.body[field])) {
          throw new Error(`${field} must be a number`);
        }
        user.commercial[field] = Number(req.body[field]);
      }
    });

    // Update string fields
    const stringFields = ["bankName", "accountHolder", "accountNumber", "ifsc", "branch", "settlementType"];
    stringFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user.commercial[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      data: user.commercial
    });
  } catch (err) {
    console.error("Update commercial error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


export const uploadDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Ensure documents object exists
    if (!user.documents) user.documents = {};

    // If no files uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded"
      });
    }

    // Save uploaded files correctly as { url, uploadedAt }
    Object.keys(req.files).forEach((key) => {
      if (req.files[key] && req.files[key][0]) {
        user.documents[key] = {
          url: req.files[key][0].filename, // you can also prepend your uploads path if needed
          uploadedAt: new Date()
        };
      }
    });

    // Set KYC status
    user.status = "pending";

    await user.save();

    res.json({
      success: true,
      message: "Documents uploaded successfully",
      data: user.documents
    });

  } catch (err) {
    console.error("UPLOAD DOC ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      data: { ...user.documents, status: user.status }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
export const deleteDocument = async (req, res) => {

  try {

    const { docKey } = req.params;

    const docs = await Document.findOne({
      user: req.user.id
    });

    if (!docs) {
      return res.status(404).json({
        message: "Documents not found"
      });
    }

    docs.documents[docKey] = null;

    await docs.save();

    res.json({
      success: true,
      message: "Document deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false
    });

  }

};

// ---------------- Get Current User (/api/user/me) ----------------
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const depositRequest = async (req, res) => {
  try {
    const { amount, utr } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!utr) {
      return res.status(400).json({ success: false, message: "UTR number required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Create transaction
    const transaction = await Transaction.create({
      user: user._id,
      agent: user.agent || null,
      amount,
      utr,
      method: "deposit",
      status: "pending"
    });

    // Commission Logic
    const commissionRecipients = [];

    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      commissionRecipients.push({
        agent: adminUser._id,
        type: "admin",
        amount: Number(amount) * 0.1, // ensure numeric
        transaction: transaction._id
      });
    }

    if (user.agent) {
      commissionRecipients.push({
        agent: user.agent,
        type: "agent",
        amount: Number(amount) * 0.05,
        transaction: transaction._id
      });
    }

    // Save commissions safely
    for (const c of commissionRecipients) {
      try {
        await Commission.create(c);
      } catch (err) {
        console.error("Failed to create commission:", c, err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      data: transaction
    });

  } catch (error) {
    console.error("DEPOSIT ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const getWallet = async (req, res) => {
  try {

    const wallet = await Wallet.findOne({ user: req.user.id });

    const transactions = await Transaction
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      balance: wallet?.balance || 0,
      transactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};