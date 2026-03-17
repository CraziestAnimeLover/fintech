import { useState, useEffect } from "react";
import { Download, X, Filter } from "lucide-react";
import { agentAPI } from "../services/api";
import { format } from "date-fns";

const Commission = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    start: "",
    end: "",
  });

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    deductions: 0,
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchCommissions();
  }, [filters]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await agentAPI.getCommissions(filters);

      if (res.data.success) {
        setCommissions(res.data.data.commissions);
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error("Commission fetch error:", err);
    }
    setLoading(false);
  };

  // ================= FILTER =================
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({ status: "", start: "", end: "" });
  };

  // ================= EXPORT =================
  const exportCSV = () => {
    const data = [
      ["Date", "Amount", "Status", "UTR"],
      ...commissions.map((c) => [
        format(new Date(c.createdAt), "dd/MM/yyyy"),
        c.amount,
        c.status,
        c.transaction?.utr || "-",
      ]),
    ];

    const csv = data.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commissions.csv";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Filter size={18} /> My Commission
        </h2>

        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-4 text-center">
        <Card title="Total" value={summary.total} color="blue" />
        <Card title="Paid" value={summary.paid} color="green" />
        <Card title="Pending" value={summary.pending} color="yellow" />
        <Card title="Deductions" value={summary.deductions} color="red" />
      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-4 gap-4">
        <select name="status" value={filters.status} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>

        <input type="date" name="start" value={filters.start} onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="end" value={filters.end} onChange={handleChange} className="border p-2 rounded" />

        <button onClick={resetFilters} className="bg-gray-200 p-2 rounded flex items-center justify-center gap-1">
          <X size={16} /> Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">UTR</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-4">Loading...</td>
              </tr>
            ) : commissions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              commissions.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{format(new Date(c.createdAt), "dd/MM/yyyy")}</td>

                  <td className="p-3 font-semibold">₹{c.amount}</td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-white text-xs ${
                      c.status === "paid" ? "bg-green-500" : "bg-yellow-500"
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-3 font-mono">{c.transaction?.utr || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ================= CARD =================
const Card = ({ title, value, color }) => {
  return (
    <div className={`bg-${color}-50 p-4 rounded-lg`}>
      <p className="text-sm text-gray-600">{title}</p>
      <h3 className={`text-xl font-bold text-${color}-600`}>
        ₹{Number(value || 0).toFixed(2)}
      </h3>
    </div>
  );
};

export default Commission;