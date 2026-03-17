import Commission from "../models/commissionModel.js";
import Transaction from "../models/Transaction.js";
import Agent from "../models/agentModel.js";

/**
 * Get all commissions for the logged-in agent with filters
 */
export const getCommissions = async (req, res) => {
  try {
    const { status, start, end, agentId } = req.query;
    const user = req.user;

    const query = {};

    // 👇 Role-based filtering
    if (user.role === "agent") {
      query.agent = user._id;
      query.type = "agent"; // only agent commission
    }

    if (user.role === "admin") {
      if (agentId) query.agent = agentId;
      // admin sees both agent + admin commissions
    }

    if (status) query.status = status;

    if (start || end) query.createdAt = {};
    if (start) query.createdAt.$gte = new Date(start);
    if (end) query.createdAt.$lte = new Date(end);

    const commissions = await Commission.find(query)
      .populate("transaction")
      .populate("agent", "name email role")
      .sort({ createdAt: -1 });

    // ✅ SUMMARY FIXED
    const summary = commissions.reduce(
      (acc, c) => {
        acc.total += c.amount;

        if (c.status === "paid") acc.paid += c.amount;
        if (c.status === "pending") acc.pending += c.amount;

        // 👉 Admin earnings
        if (c.type === "admin") acc.adminTotal += c.amount;

        // 👉 Agent earnings
        if (c.type === "agent") acc.agentTotal += c.amount;

        // 👉 Deductions only for agent
        if (c.type === "agent" && c.transaction) {
          const mdr = c.transaction.mdr || 0;
          const totalMDR = (c.transaction.amount * mdr) / 100;

          acc.deductions += totalMDR - c.amount;
        }

        return acc;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        deductions: 0,
        adminTotal: 0,
        agentTotal: 0,
      }
    );

    res.json({
      success: true,
      data: { commissions, summary },
    });
  } catch (err) {
    console.error("getCommissions Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch commissions",
    });
  }
};
export const withdrawCommission = async (req, res) => {
  const agentId = req.user._id;
  const { amount } = req.body;

  try {
    const pendingCommissions = await Commission.find({
      agent: agentId,
      status: "pending",
      type: "agent", // ✅ IMPORTANT
    });

    const totalPending = pendingCommissions.reduce((acc, c) => acc + c.amount, 0);

    if (totalPending <= 0) {
      return res.status(400).json({
        success: false,
        message: "No pending commission available",
      });
    }

    if (amount > totalPending) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal amount exceeds pending commission",
      });
    }

    const agent = await Agent.findById(agentId);
    agent.walletBalance = (agent.walletBalance || 0) + amount;
    await agent.save();

    let remaining = amount;

    for (let commission of pendingCommissions) {
      if (remaining <= 0) break;

      if (commission.amount <= remaining) {
        remaining -= commission.amount;
        commission.status = "paid";
        await commission.save();
      } else {
        commission.amount -= remaining;

        await Commission.create({
          agent: agentId,
          transaction: commission.transaction,
          amount: remaining,
          status: "paid",
          type: "agent", // ✅ IMPORTANT
        });

        remaining = 0;
      }
    }

    const withdrawalTransaction = new Transaction({
      user: agentId,
      amount,
      method: "withdraw",
      status: "approved",
    });

    await withdrawalTransaction.save();

    res.json({
      success: true,
      message: "Commission withdrawn successfully",
      transaction: withdrawalTransaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to withdraw commission",
    });
  }
};
