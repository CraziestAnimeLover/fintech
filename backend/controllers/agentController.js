import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Commission from "../models/commissionModel.js";

/*
GET AGENT DASHBOARD STATS
*/
export const getAgentDashboardStats = async (req, res) => {
  try {

    const agentId = req.user._id;

    // users created by this agent
    const totalUsers = await User.countDocuments({ agent: agentId });

    // transactions by those users
    const transactions = await Transaction.find()
      .populate("user");

    const agentTransactions = transactions.filter(
      (t) => t.user?.agent?.toString() === agentId.toString()
    );

    // commissions
    const commissions = await Commission.find({ agent: agentId });

    const commissionEarned = commissions.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    const pendingCommission = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: {
        walletBalance: commissionEarned,
        totalUsers,
        transactionsCount: agentTransactions.length,
        commissionEarned,
        pendingCommission
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats"
    });
  }
};


/*
GET AGENT TRANSACTIONS
*/
export const getAgentTransactions = async (req, res) => {

  try {

    const agentId = req.user._id;

    const users = await User.find({ agent: agentId });

    const userIds = users.map((u) => u._id);

    const transactions = await Transaction.find({
      user: { $in: userIds }
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        transactions
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error getting transactions"
    });

  }

};


/*
WITHDRAW COMMISSION
*/
export const withdrawCommission = async (req, res) => {

  try {

    const agentId = req.user._id;

    const commissions = await Commission.find({
      agent: agentId,
      status: "pending"
    });

    if (!commissions.length) {
      return res.status(400).json({
        success: false,
        message: "No pending commission"
      });
    }

    let total = 0;

    for (let c of commissions) {
      total += c.amount;
      c.status = "paid";
      await c.save();
    }

    res.json({
      success: true,
      message: "Commission withdrawn",
      amount: total
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Withdraw failed"
    });

  }

};

// GET /api/agents  -> Admin only
export const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }, "_id name email");
    res.json({ success: true, data: agents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch agents" });
  }
};