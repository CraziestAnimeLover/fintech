import { useState, useEffect } from "react";
import { userAPI } from "../services/api";

const WithdrawMoney = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch agent's bank accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await userAPI.getBankAccounts();
        if (res.data.success) {
          setBankAccounts(res.data.data || []);
          if (res.data.data.length > 0) {
            setSelectedBank(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch bank accounts.");
      }
    };
    fetchAccounts();
  }, []);

  // Calculate fee dynamically (e.g., 1% fee)
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const calculatedFee = amt * 0.01;
    setFee(calculatedFee);
    setTotal(amt - calculatedFee);
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      setMessage("Please select a bank account.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid withdrawal amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await userAPI.requestPayout({
        bankAccountId: selectedBank,
        amount: parseFloat(amount),
      });

      if (res.data.success) {
        setMessage(`Withdrawal requested successfully! Transaction ID: ${res.data.data.transactionId}`);
        setAmount("");
      } else {
        setMessage(res.data.message || "Withdrawal failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Withdraw Money</h2>

      {message && (
        <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Bank Account</label>
          <select
            className="w-full border rounded p-2"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            {bankAccounts.map((bank) => (
              <option key={bank._id} value={bank._id}>
                {bank.bankName} - {bank.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Amount to Withdraw</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Fee Preview */}
        <div className="text-sm text-gray-600">
          Transaction Fee (1%): ₹{fee.toFixed(2)} <br />
          Total Amount to Receive: ₹{total.toFixed(2)}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawMoney;