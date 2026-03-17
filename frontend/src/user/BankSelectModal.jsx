// BankSelectModal.jsx
import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const BankSelectModal = ({ isOpen, onClose, walletBalance, refreshWallet }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user bank accounts when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchBanks = async () => {
      try {
        const res = await userAPI.getBankAccounts();
        setBanks(res.banks || []);
        if (res.banks?.length > 0) setSelectedBankId(res.banks[0]._id);
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      }
    };

    fetchBanks();
  }, [isOpen]);

  const handleWithdraw = async () => {
    if (!selectedBankId) {
      alert("Please select a bank account");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (Number(amount) > walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }

    setLoading(true);

    try {
      const result = await userAPI.withdraw({
        amount: Number(amount),
        bankId: selectedBankId,
      });

      setLoading(false);

      if (result.success) {
        alert(result.message);
        setAmount("");
        refreshWallet(); // refresh wallet balance in parent
        onClose(); // close modal
      } else {
        alert(result.message);
      }
    } catch (err) {
      setLoading(false);
      console.error("Withdraw error:", err);
      alert(err.response?.data?.message || "Withdrawal failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>

        <label className="block mb-2 font-medium">Select Bank Account:</label>
        <select
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.bankName} - {bank.accountNumber.slice(-4)}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Amount (₹):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankSelectModal;