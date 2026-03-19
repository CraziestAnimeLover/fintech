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

  // Filter States
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
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Filter Logic
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
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const rejectDeposit = async (id) => {
    try {
      await adminAPI.rejectDeposit(id);
      fetchDeposits();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject deposit");
    }
  };

  // Export Handlers
  const downloadExcel = () => {
    const data = filteredDeposits.map((d) => ({
      "Transaction ID": d._id.slice(-6).toUpperCase(),
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
    saveAs(blob, "deposits-report.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Deposit Report", 14, 15);
    const tableData = filteredDeposits.map((d) => [
      d._id.slice(-6).toUpperCase(),
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
    doc.save("deposits-report.pdf");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-400 font-medium animate-pulse">
      Loading deposits...
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Deposit Requests</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and verify user fund transfers</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadExcel} 
            className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border border-gray-100"
          >
            Export CSV
          </button>
          <button 
            onClick={downloadPDF} 
            className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border border-gray-100"
          >
            PDF Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <input
          type="text"
          placeholder="Search Txn, User, or UTR"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-50 border-none focus:ring-2 focus:ring-black/5 rounded-2xl p-4 text-sm placeholder:text-gray-400 text-gray-900"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border-none focus:ring-2 focus:ring-black/5 rounded-2xl p-4 text-sm text-gray-600 appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="relative group">
            <span className="absolute -top-2 left-4 px-1 bg-white text-[10px] text-gray-400 font-bold">FROM</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-black/5 rounded-2xl p-4 text-sm text-gray-600"
            />
        </div>

        <div className="relative group">
            <span className="absolute -top-2 left-4 px-1 bg-white text-[10px] text-gray-400 font-bold">TO</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-black/5 rounded-2xl p-4 text-sm text-gray-600"
            />
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[11px] uppercase tracking-[0.2em] border-b border-gray-50">
              <th className="pb-5 font-bold px-2">Txn Detail</th>
              <th className="pb-5 font-bold">User</th>
              <th className="pb-5 font-bold">Amount</th>
              <th className="pb-5 font-bold">Method</th>
              <th className="pb-5 font-bold">Status</th>
              <th className="pb-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDeposits.map((d) => (
              <tr key={d._id} className="group hover:bg-gray-50/40 transition-all duration-200">
                {/* TXN DETAIL - BLACK & BOLD */}
                <td className="py-6 px-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-black font-bold tracking-tight">
                      #{d._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold mt-1">
                      UTR: {d.utr || 'N/A'}
                    </span>
                  </div>
                </td>

                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                      {d.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm leading-tight">{d.user?.name}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>

                <td className="py-6 text-gray-900 font-black text-base">
                  ₹{d.amount.toLocaleString()}
                </td>

                <td className="py-6">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                    {d.method}
                  </span>
                </td>

                <td className="py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    d.status === "approved" ? "bg-emerald-50 text-emerald-600" : 
                    d.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {d.status}
                  </span>
                </td>

                <td className="py-6 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {d.status === "pending" && (
                      <>
                        <button 
                          onClick={() => approveDeposit(d._id)} 
                          className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md shadow-gray-200"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => rejectDeposit(d._id)} 
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-3 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => downloadInvoice(d)} 
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-gray-200 transition-colors"
                    >
                      Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDeposits.length === 0 && (
          <div className="py-32 text-center">
            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
               <span className="text-2xl">📁</span>
            </div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No matching deposits found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposits;