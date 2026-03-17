import Commission from "../models/commissionModel.js";
import Wallet from "../models/Wallet.js";

export const createCommission = async (transaction) => {
  try {
    // prevent duplicate commission
    if (transaction.commissionGenerated) return;

    const mdrAmount = (transaction.amount * transaction.mdr) / 100;

    // ✅ CASE 1: NO AGENT → ADMIN GETS FULL
    if (!transaction.agent) {
      transaction.adminShare = mdrAmount;
      transaction.platformProfit = mdrAmount;
      transaction.agentShare = 0;
      transaction.commissionGenerated = true;

      await transaction.save();

      // optional: admin commission entry
      await Commission.create({
        type: "admin",
        transaction: transaction._id,
        amount: mdrAmount,
        status: "pending",
      });

      return;
    }

    // ✅ CASE 2: AGENT EXISTS → SPLIT
    const agentShare = mdrAmount * 0.5;
    const adminShare = mdrAmount - agentShare;

    transaction.agentShare = agentShare;
    transaction.adminShare = adminShare;
    transaction.platformProfit = adminShare;
    transaction.commissionGenerated = true;

    await transaction.save();

    // ✅ Agent commission
    await Commission.create({
      agent: transaction.agent,
      type: "agent",
      transaction: transaction._id,
      amount: agentShare,
      status: "pending",
    });

    // ✅ Admin commission
    await Commission.create({
      type: "admin",
      transaction: transaction._id,
      amount: adminShare,
      status: "pending",
    });

    // ✅ Update agent wallet
    const agentWallet = await Wallet.findOne({ user: transaction.agent });

    if (agentWallet) {
      agentWallet.commissionBalance =
        (agentWallet.commissionBalance || 0) + agentShare;

      await agentWallet.save();
    }

  } catch (err) {
    console.error("Commission error:", err);
  }
};