import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const Payouts = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch bank accounts
  const fetchBanks = async () => {
    try {
      const res = await userAPI.getBankAccounts();
      setBanks(res.data.banks || []); // .data is important
    } catch (error) {
      console.error("Failed to load banks", error);
      alert("Failed to load banks");
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // Withdraw request
  const handleWithdraw = async () => {
    if (!selectedBank) return alert("Please select a bank");
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");

    try {
      setLoading(true);

      const res = await userAPI.withdraw({
        amount: Number(amount),
        bankId: selectedBank,
      });

      alert(res.data.message || "Withdraw successful");
      setAmount("");
      setSelectedBank("");
    } catch (error) {
      console.error("Withdraw Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Withdraw to Bank</h2>

      {/* Bank Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Bank Account</label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Select Bank</option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.bankName} • {bank.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Withdraw Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
};

export default Payouts;