import { useState } from "react";
import { Send } from "lucide-react";
import { userAPI } from "../services/api";

const Transfer = () => {
  const [form, setForm] = useState({
    toUserId: "",
    amount: "",
    currency: "INR",
    note: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.toUserId || !form.amount) {
      return setMessage({
        type: "error",
        text: "Receiver ID and amount are required"
      });
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await userAPI.transfer(form);

      setMessage({
        type: "success",
        text: res.data.message || "Transfer successful"
      });

      setForm({
        toUserId: "",
        amount: "",
        currency: "INR",
        note: ""
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Transfer failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">

      <div className="flex items-center gap-2 mb-6">
        <Send className="text-blue-600" size={22} />
        <h2 className="text-xl font-semibold">Send Money</h2>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Receiver ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Receiver User ID
          </label>
          <input
            type="text"
            name="toUserId"
            value={form.toUserId}
            onChange={handleChange}
            placeholder="Enter receiver user ID"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Currency
          </label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Note (Optional)
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Add a note"
            rows="3"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Send Money"}
        </button>
      </form>
    </div>
  );
};

export default Transfer;