import { useState, useEffect } from "react";
import { Send, Download, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { userAPI } from "../services/api";
import WithdrawToBank from "./WithdrawToBank";

const Wallet = () => {
  const { user, theme } = useOutletContext();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [depositAmount, setDepositAmount] = useState("");
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  // ✅ SAFE helper (never crash)
  const getLast4 = (acc) => {
    if (!acc) return "XXXX";
    return acc.slice(-4);
  };

  // Fetch wallet & transactions
  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getWallet(user._id, user.role);
      const txns = res.data.transactions || [];
      setTransactions(txns);

      const computedBalance = txns.reduce((sum, tx) => {
        if (tx.status !== "approved") return sum;

        if (tx.method === "deposit") {
          return sum + Number((tx.amount * 0.98).toFixed(2));
        }

        if (tx.method === "withdraw" || tx.method === "transfer") {
          return sum - Number(tx.amount);
        }

        return sum;
      }, 0);

      setBalance(computedBalance);
    } catch (err) {
      console.error("Wallet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch bank accounts (FIXED)
const fetchBanks = async () => {
  try {
    const res = await userAPI.getBankAccounts();

    console.log("🔥 FULL RESPONSE:", res); // DEBUG

    const bankList = res.accounts || [];

    console.log("✅ BANK LIST:", bankList);

    setBanks(bankList);

    if (bankList.length > 0) {
      setSelectedBankId(bankList[0]._id);
    }

  } catch (err) {
    console.error("❌ Bank fetch error:", err);
  }
};
  useEffect(() => {
    if (user?._id) {
      fetchWallet();
      fetchBanks();
    }
  }, [user]);

  const generateUTR = () =>
    `UTR${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  const handleDepositRequest = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      return alert("Enter a valid amount");
    }

    if (!selectedBankId) {
      return alert("Please select a bank account");
    }

    setDepositLoading(true);
    const utr = generateUTR();

    try {
      const result = await userAPI.depositRequest({
        userId: user._id,
        role: user.role,
        amount: Number(depositAmount),
        bankId: selectedBankId,
        utr,
      });

      setDepositLoading(false);

      if (result.data?.success) {
        alert(`Deposit request submitted\nUTR: ${utr}`);
        setDepositAmount("");
        fetchWallet();
      } else {
        alert(result.data?.message || "Deposit request failed");
      }
    } catch (err) {
      setDepositLoading(false);
      console.error("Deposit request error:", err);
      alert(err.response?.data?.message || "Deposit request failed");
    }
  };

  const getAmountDisplay = (txn) => {
    if (txn.status !== "approved") return `₹${txn.amount}`;

    if (txn.method === "deposit") {
      return `+₹${(txn.amount * 0.98).toFixed(2)}`;
    }

    if (txn.method === "withdraw" || txn.method === "transfer") {
      return `-₹${txn.amount}`;
    }

    return `₹${txn.amount}`;
  };

  const getAmountColor = (txn) => {
    if (txn.status !== "approved") {
      return theme === "dark" ? "text-gray-400" : "text-gray-500";
    }

    return txn.method === "deposit" ? "text-green-500" : "text-red-500";
  };

  const cardClass = theme === "dark" ? "bg-gray-700" : "bg-white";
  const inputClass =
    theme === "dark"
      ? "bg-gray-800 border-gray-600 text-gray-200"
      : "bg-white border-gray-300";

  return (
    <div className={`p-6 space-y-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
          Wallet
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          Manage your funds and transactions
        </p>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">Available Balance</p>
          <h2 className="text-4xl font-bold mt-1">
            {loading ? "Loading..." : `₹${balance.toLocaleString()}`}
          </h2>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg"
        >
          <Download size={18} /> Withdraw
        </button>
      </div>

      {/* Deposit */}
      <div className={`${cardClass} p-6 rounded-xl shadow space-y-4`}>
        <h2 className="text-lg font-semibold">Bank Transfer Deposit</h2>

        <select
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
          className={`w-full border p-2 rounded ${inputClass}`}
        >
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.bankName} - **** {getLast4(bank.accountNumber)}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Enter Amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className={`border p-2 w-full rounded ${inputClass}`}
        />

        <button
          onClick={handleDepositRequest}
          disabled={depositLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          {depositLoading ? "Submitting..." : "Submit Deposit"}
        </button>
      </div>

      {/* Transactions */}
      <div className={`${cardClass} shadow rounded-xl p-6`}>
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>

        {transactions.map((txn) => (
          <div key={txn._id} className="flex justify-between border-b py-2">
            <span>{txn.method}</span>
            <span className={getAmountColor(txn)}>
              {getAmountDisplay(txn)}
            </span>
          </div>
        ))}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawToBank
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onWithdrawSuccess={fetchWallet}
          user={user}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Wallet;