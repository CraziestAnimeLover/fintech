import { useEffect, useState } from "react";
import { adminAPI } from "../services/api";
import { downloadInvoice } from "../utils/invoiceGenerator";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchDeposits = async () => {
    try {
      const res = await adminAPI.getDeposits();
      const data = res.data.deposits || [];
      setDeposits(data);
      setFilteredDeposits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // FILTER LOGIC
  useEffect(() => {
    let data = [...deposits];

    if (search) {
      data = data.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          d.utr?.toLowerCase().includes(search.toLowerCase()) ||
          d._id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      data = data.filter((d) => d.status === statusFilter);
    }

    if (fromDate) {
      data = data.filter((d) => new Date(d.createdAt) >= new Date(fromDate));
    }

    if (toDate) {
      data = data.filter((d) => new Date(d.createdAt) <= new Date(toDate));
    }

    setFilteredDeposits(data);
  }, [search, statusFilter, fromDate, toDate, deposits]);

  const approveDeposit = async (id) => {
    try {
      await adminAPI.approveDeposit(id);
      fetchDeposits();
    } catch {
      alert("Failed");
    }
  };

  const rejectDeposit = async (id) => {
    try {
      await adminAPI.rejectDeposit(id);
      fetchDeposits();
    } catch {
      alert("Failed");
    }
  };

  // ✅ Download Excel for filtered deposits
  const downloadExcel = () => {
  const data = filteredDeposits.map((d) => ({
    "Transaction ID": d._id.slice(-6),
    User: d.user?.name,
    Amount: `₹${d.amount}`,
    UTR: d.utr?.toString() || "-",
    Method: d.method,
    Date: new Date(d.createdAt).toLocaleDateString(),
    Status: d.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "filtered-deposits.xlsx");
};

const downloadPDF = () => {
  const doc = new jsPDF();
  doc.text("Deposit Report", 14, 15);

  const tableData = filteredDeposits.map((d) => [
    d._id.slice(-6),
    d.user?.name || "-",
    `₹${d.amount}`,
    d.utr?.toString() || "-",
    d.method,
    new Date(d.createdAt).toLocaleDateString(),
    d.status,
  ]);

  autoTable(doc, {
    head: [["Txn ID", "User", "Amount", "UTR", "Method", "Date", "Status"]],
    body: tableData,
    startY: 20,
  });

  doc.save("filtered-deposits.pdf");
};

  if (loading) return <p>Loading deposits...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Deposit Requests</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by User / UTR / Txn ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div>
          <label className="text-sm mr-1">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <div>
          <label className="text-sm mr-1">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>

        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Txn ID</th>
            <th className="p-3">User</th>
            <th className="p-3">Amount</th>
            <th className="p-3">UTR</th>
            <th className="p-3">Method</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDeposits.map((d) => (
            <tr key={d._id} className="border-t">
              <td className="p-3">{d._id.slice(-6)}</td>
              <td className="p-3">{d.user?.name}</td>
              <td className="p-3 font-semibold">₹{d.amount}</td>
              <td className="p-3">{d.utr || "-"}</td>
              <td className="p-3 capitalize">{d.method}</td>
              <td className="p-3">{new Date(d.createdAt).toLocaleDateString()}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    d.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : d.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {d.status}
                </span>
              </td>
              <td className="p-3 space-x-2">
                {d.status === "pending" && (
                  <>
                    <button
                      onClick={() => approveDeposit(d._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectDeposit(d._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => downloadInvoice(d)}
                  className="bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Deposits;