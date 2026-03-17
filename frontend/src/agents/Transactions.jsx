import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { Filter } from "lucide-react";

const Transactions = () => {
  const [filters, setFilters] = useState({
    method: "", // deposit, withdraw, transfer
    date: "",   // date filter
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle filter input changes
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch transactions from wallet endpoint
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getWallet(); // wallet returns { balance, transactions }
      let txns = res.data.transactions || [];

      // Apply frontend filters
      if (filters.method) {
        txns = txns.filter(tx => tx.method === filters.method);
      }
      if (filters.date) {
        const filterDate = new Date(filters.date).toDateString();
        txns = txns.filter(tx => new Date(tx.createdAt).toDateString() === filterDate);
      }

      setTransactions(txns);
    } catch (error) {
      console.error("Transaction fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch whenever filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-blue-600"/>
        <h2 className="text-xl font-semibold">Transaction History</h2>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Transaction Type</label>
          <select
            name="method"
            value={filters.method}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{tx.description || "Transaction"}</td>
                  <td className="p-3 capitalize">{tx.method}</td>
                  <td className={`p-3 ${
                    tx.method === "deposit" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.method === "deposit" ? "+" : "-"}₹{tx.amount}
                  </td>
                  <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;