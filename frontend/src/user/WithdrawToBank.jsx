import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const WithdrawToBank = ({
  isOpen,
  onClose,
  onWithdrawSuccess,
  banks = [],
  defaultBankId = "",
}) => {
  const [selectedBankId, setSelectedBankId] = useState(defaultBankId);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Update selected bank when modal opens or defaultBankId changes
  useEffect(() => {
    if (isOpen) {
      setSelectedBankId(defaultBankId || (banks[0]?._id || ""));
      setAmount(""); // reset amount each time modal opens
    }
  }, [isOpen, defaultBankId, banks]);

  const handleWithdraw = async () => {
    if (!selectedBankId) return alert("Please select a bank account");
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");

    setLoading(true);
    try {
      const result = await userAPI.withdraw({
        amount: Number(amount),
        bankId: selectedBankId,
      });

      setLoading(false);

      if (result.data?.success) {
        alert(result.data.message || "Withdrawal successful");
        onWithdrawSuccess(); // refresh wallet balance
        onClose(); // close modal
      } else {
        alert(result.data?.message || "Withdrawal failed");
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
        <h2 className="text-xl font-semibold mb-4">Withdraw to Bank</h2>

        <label className="block mb-2 font-medium">Bank Account:</label>
        <select
          value={selectedBankId || ""}
          onChange={(e) => setSelectedBankId(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="" disabled>
            -- Select Bank --
          </option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.bankName} - **** {bank.accountNumber.slice(-4)}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Amount (₹):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawToBank;