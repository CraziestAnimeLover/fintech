import Commission from "../models/commissionModel.js";
import Wallet from "../models/Wallet.js";

export const createCommission = async (transaction) => {
  try {
    console.log("🔥 Commission Triggered:", transaction._id);

    if (transaction.commissionGenerated) return;

    // 🔥 SAFETY FIX (old data support)
    if (!transaction.agent && transaction.user?.agent) {
      transaction.agent = transaction.user.agent;
    }

    const mdrAmount = (transaction.amount * transaction.mdr) / 100;

    // ❌ NO AGENT → FULL ADMIN
    if (!transaction.agent) {
      console.log("❌ NO AGENT → ADMIN ONLY");

      transaction.adminShare = mdrAmount;
      transaction.platformProfit = mdrAmount;
      transaction.agentShare = 0;
      transaction.commissionGenerated = true;

      await transaction.save();

      await Commission.create({
        type: "admin",
        transaction: transaction._id,
        amount: mdrAmount,
        status: "paid",
      });

      return;
    }

    // ✅ AGENT EXISTS
    console.log("✅ AGENT FOUND:", transaction.agent);

    const agentShare = mdrAmount * 0.5;
    const adminShare = mdrAmount - agentShare;

    transaction.agentShare = agentShare;
    transaction.adminShare = adminShare;
    transaction.platformProfit = adminShare;
    transaction.commissionGenerated = true;

    await transaction.save();

    // 👉 Agent commission
    await Commission.create({
      agent: transaction.agent,
      type: "agent",
      transaction: transaction._id,
      amount: agentShare,
      status: "paid",
    });

    // 👉 Admin commission
    await Commission.create({
      type: "admin",
      transaction: transaction._id,
      amount: adminShare,
      status: "paid",
    });

    // 👉 Update wallet
    let wallet = await Wallet.findOne({ user: transaction.agent });

    if (!wallet) {
      wallet = await Wallet.create({
        user: transaction.agent,
        commissionBalance: 0,
      });
    }

    wallet.commissionBalance += agentShare;
    await wallet.save();

  } catch (err) {
    console.error("❌ Commission error:", err);
  }
};