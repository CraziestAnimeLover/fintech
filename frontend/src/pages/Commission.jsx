import { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";
import { adminAPI } from "../services/api";
import Cards from "../admin/commision/Cards";
import Filters from "../admin/commision/Filters";
import Charts from "../admin/commision/Charts";
import CommissionTable from "../admin/commision/CommissionTable";

const Commission = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ agentId: "", status: "", start: "", end: "" });
  const [summary, setSummary] = useState({ total: 0, pending: 0, paid: 0, deductions: 0, adminTotal: 0, agentTotal: 0 });
  const [agents, setAgents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchCommissions();
    if (user.role === "admin") fetchAgents();
  }, [filters]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCommissions(filters);
      if (res?.data?.success) {
        setCommissions(res?.data?.data?.commissions || []);
        setSummary(res?.data?.data?.summary || {});
      } else setCommissions([]);
    } catch (err) {
      console.error(err);
      setCommissions([]);
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await adminAPI.getAgents();
      if (res.data.success) setAgents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const data = [
      ["Date", "Type", "Agent", "Amount", "Status", "Admin Share", "UTR"],
      ...commissions.map(c => [
        new Date(c.createdAt).toLocaleDateString(),
        c.type,
        c.agent?.name || "ADMIN",
        c.amount,
        c.status,
        c.type === "admin" ? c.amount : "-",
        c.transaction?.utr || "-"
      ])
    ];
    const csv = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commissions.csv";
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Commission Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded"
          >
            <Filter size={16} /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
          >
            {showTable ? "Hide Table" : "Show Table"}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
        <Cards summary={summary} />
      </div>

      {/* FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <Filters filters={filters} setFilters={setFilters} agents={agents} user={user} />
          </div>
        </div>
      )}

      {/* CHARTS */}
    {/* CHARTS */}
<div className="space-y-6">
  {/* Bar Chart - Full width */}
  <div className="bg-white p-6 rounded-xl shadow-lg h-96">
    <h3 className="text-xl font-semibold mb-4">Commission Overview</h3>
    <Charts summary={summary} type="bar" />
  </div>


</div>

      {/* TABLE MODAL */}
      {showTable && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 md:w-4/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Transactions</h3>
              <button onClick={() => setShowTable(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <CommissionTable commissions={commissions} loading={loading} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Commission;