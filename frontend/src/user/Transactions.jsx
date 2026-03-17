import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { userAPI } from "../services/api";
import { Filter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadInvoice } from "../utils/invoiceGenerator";

const Transactions = () => {
  const { user } = useOutletContext();

  const [filters, setFilters] = useState({
    method: "",
    date: "",
    status: "",
  });
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getWallet(user._id, user.role);
      let txns = res.data.transactions || [];

      // Apply filters
      if (filters.method) txns = txns.filter((tx) => tx.method === filters.method);
      if (filters.status) txns = txns.filter((tx) => tx.status === filters.status);
      if (filters.date) {
        const filterDate = new Date(filters.date).toDateString();
        txns = txns.filter((tx) => new Date(tx.createdAt).toDateString() === filterDate);
      }
      if (search) {
        txns = txns.filter(
          (tx) =>
            tx._id.toLowerCase().includes(search.toLowerCase()) ||
            (tx.utr && tx.utr.toLowerCase().includes(search.toLowerCase()))
        );
      }

      setTransactions(txns);
    } catch (err) {
      console.error("Transaction fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters, search, user]);

  // Calculate stats with settled amounts
  const totalSettle = transactions
    .filter((tx) => tx.method === "deposit" && tx.status === "approved")
    .reduce((sum, tx) => sum + tx.amount * 0.98, 0);

  const successCount = transactions.filter((tx) => tx.status === "approved").length;
  const pendingCount = transactions.filter((tx) => tx.status === "pending").length;
  const failedCount = transactions.filter((tx) => tx.status === "rejected").length;

  // Excel Export
  const exportExcel = () => {
    const data = transactions.map((tx, index) => ({
      "#": index + 1,
      "Transaction ID": tx._id,
      Amount: tx.amount,
      Tax: tx.status === "approved" ? (tx.amount * 0.02).toFixed(2) : "-",
      "Settle Amount": tx.status === "approved" ? (tx.amount * 0.98).toFixed(2) : "-",
      UTR: tx.utr || "-",
      Status: tx.status,
      Date: new Date(tx.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableData = transactions.map((tx, index) => [
      index + 1,
      tx._id.slice(-8),
      tx.amount,
      tx.status === "approved" ? (tx.amount * 0.02).toFixed(2) : "-",
      tx.status === "approved" ? (tx.amount * 0.98).toFixed(2) : "-",
      tx.utr || "-",
      tx.status,
      new Date(tx.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["#", "Trans ID", "Amount", "Tax", "Settle", "UTR", "Status", "Date"]],
      body: tableData,
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>

        <div className="flex gap-2">
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
            Excel
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">
            PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Transaction ID or UTR"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-64"
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-600">₹{totalSettle.toFixed(2)}</h3>
          <p className="text-sm">Total Settled Amount</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-blue-600">{successCount}</h3>
          <p className="text-sm">Successful</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-600">{pendingCount}</h3>
          <p className="text-sm">Pending</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-red-600">{failedCount}</h3>
          <p className="text-sm">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <select name="method" value={filters.method} onChange={handleChange} className="border rounded-lg p-2">
          <option value="">All</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
          <option value="transfer">Transfer</option>
        </select>

        <select name="status" value={filters.status} onChange={handleChange} className="border rounded-lg p-2">
          <option value="">All</option>
          <option value="approved">Successful</option>
          <option value="pending">Pending</option>
          <option value="rejected">Failed</option>
        </select>

        <input type="date" name="date" value={filters.date} onChange={handleChange} className="border rounded-lg p-2" />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Trans ID</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Tax</th>
              <th className="p-3 text-left">Settle</th>
              <th className="p-3 text-left">UTR</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr key={tx._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{tx._id.slice(-8)}</td>
                  <td className={`p-3 ${tx.status !== "approved" ? "text-gray-500" : tx.method === "deposit" ? "text-green-600" : "text-red-600"}`}>
                    {tx.status === "approved" ? (tx.method === "deposit" ? `+₹${tx.amount}` : `-₹${tx.amount}`) : `₹${tx.amount}`}
                  </td>
                  <td className="p-3">{tx.status === "approved" ? `₹${(tx.amount * 0.02).toFixed(2)}` : "-"}</td>
                  <td className="p-3">{tx.status === "approved" ? `₹${(tx.amount * 0.98).toFixed(2)}` : "-"}</td>
                  <td className="p-3">{tx.utr || "-"}</td>
                  <td className="p-3 capitalize">{tx.status}</td>
                  <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => downloadInvoice(tx)} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                      Invoice
                    </button>
                  </td>
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