import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { createCommission } from "../utils/commissionService.js";
import Wallet from "../models/Wallet.js";


// @desc Get all users
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-otp");

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


// @desc Get user by ID
export async function getUserById(req, res) {
  try {

    const user = await User.findById(req.params.id).select("-otp");

    if (!user) {
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }

    res.status(200).json({
      success:true,
      data:user
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success:false,
      message:"Error getting user"
    })
  }
}


// @desc Create new user
export async function createUser(req,res){

  try{

    const {name,email,phone,password,role} = req.body

    const existingUser = await User.findOne({
      $or:[{email},{phone}]
    })

    if(existingUser){
      return res.status(400).json({
        success:false,
        message:"User already exists"
      })
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "user"
    })

    res.status(201).json({
      success:true,
      data:user
    })

  }catch(err){
    console.error(err)
    res.status(500).json({
      success:false,
      message:"Error creating user"
    })
  }

}


// @desc Update user
export async function updateUser(req,res){

  try{

    const {name,email,phone,role,isVerified} = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {name,email,phone,role,isVerified},
      {new:true, runValidators:true}
    ).select("-otp")

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }

    res.status(200).json({
      success:true,
      data:user
    })

  }catch(err){
    console.error(err)
    res.status(500).json({
      success:false,
      message:"Error updating user"
    })
  }

}


// @desc Delete user
export async function deleteUser(req,res){

  try{

    const user = await User.findById(req.params.id)

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success:true,
      message:"User deleted successfully"
    })

  }catch(err){
    console.error(err)
    res.status(500).json({
      success:false,
      message:"Error deleting user"
    })
  }

}


// @desc Admin stats
// @desc Admin stats
export async function getStats(req,res){

  try{

    const totalUsers = await User.countDocuments()
    const verifiedUsers = await User.countDocuments({isVerified:true})
    const adminUsers = await User.countDocuments({role:"admin"})
    const agentUsers = await User.countDocuments({role:"agent"}) // ✅ ADD THIS
    const regularUsers = await User.countDocuments({role:"user"})

    res.status(200).json({
      success:true,
      data:{
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        adminUsers,
        agentUsers, // ✅ ADD THIS
        regularUsers
      }
    })

  }catch(err){
    console.error(err)
    res.status(500).json({
      success:false,
      message:"Error getting stats"
    })
  }

}

export const verifyDocuments = async (req, res) => {
  try {

    const { id } = req.params;
    const { status, remark } = req.body;

    const allowedStatus = ["pending", "approved", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = status;
    user.adminRemark = remark;

    if (status === "approved") {
      user.isVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "KYC status updated",
      data: user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
// Approve deposit and handle wallet & commission
export const approveDeposit = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
      .populate("user")
      .populate("agent");

    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    if (tx.method !== "deposit") return res.status(400).json({ message: "Invalid transaction type" });
    if (tx.status !== "pending") return res.status(400).json({ message: "Already processed" });

    tx.status = "approved";
    const mdrAmount = (tx.amount * tx.mdr) / 100;
    const settlementAmount = tx.amount - mdrAmount;
    tx.settlementAmount = settlementAmount;
    await tx.save();

    // ✅ Wallet check / auto-create
    let wallet = await Wallet.findOne({ user: tx.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: tx.user._id,
        balance: 0,
        payinWallet: 0,
        settlementBalance: 0,
      });
    }

    wallet.balance += settlementAmount;
    wallet.payinWallet += tx.amount;
    wallet.settlementBalance += settlementAmount;

    await wallet.save();

    await createCommission(tx);

    res.json({
      success: true,
      message: "Deposit approved",
      data: tx,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const rejectDeposit = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    transaction.status = "rejected";
    await transaction.save();

    res.json({
      success: true,
      message: "Deposit rejected"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Transaction.find({ method: "deposit" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deposits.length,
      deposits
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const approveWithdraw = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.method !== "withdraw") {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    const wallet = await Wallet.findOne({ user: transaction.user });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.settlementBalance < transaction.amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct withdrawable balance
    wallet.settlementBalance -= transaction.amount;

    // Update total wallet balance
    wallet.balance -= transaction.amount;

    await wallet.save();

    transaction.status = "approved";

    await transaction.save();

    res.json({
      success: true,
      message: "Withdraw approved and wallet updated"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
export const getAllWithdraws = async (req, res) => {
  try {

    const withdraws = await Transaction.find({ method: "withdraw" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: withdraws.length,
      withdraws
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
export const rejectWithdraw = async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.status = "rejected";

    await transaction.save();

    res.json({
      success: true,
      message: "Withdraw rejected"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};