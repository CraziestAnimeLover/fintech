import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { adminAPI } from "../services/api";

const DepositMoney = () => {
  const [formData, setFormData] = useState({
    userId: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Simple validation
    if (!formData.userId || !formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setError("Please enter valid user ID and amount.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await adminAPI.depositMoney(formData.userId, Number(formData.amount));

      if (data?.success) {
        setSuccess(`₹${formData.amount} deposited successfully to User ID: ${formData.userId}`);
        setFormData({ userId: "", amount: "" });
      } else {
        setError(data.message || "Deposit failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during deposit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <PlusCircle size={28} /> Deposit Money
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      )}

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter user ID"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount to deposit"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            min={1}
          />
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      </form>
    </div>
  );
};

export default DepositMoney;