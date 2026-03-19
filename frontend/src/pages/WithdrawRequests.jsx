import { useEffect, useState } from "react";
import { adminAPI } from "../services/api";

const WithdrawRequests = () => {
  const [withdraws, setWithdraws] = useState([]);

  const fetchWithdraws = async () => {
    const res = await adminAPI.getWithdraws();
    setWithdraws(res.data.withdraws);
  };

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const approveWithdraw = async (id) => {
    await adminAPI.approveWithdraw(id);
    fetchWithdraws();
  };

  // Helper to style the status badges
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "approved":
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Withdraw Requests</h2>
        <span className="text-sm text-gray-400 font-medium">{withdraws.length} total requests</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-400 uppercase text-xs tracking-widest">
              <th className="px-6 py-3 font-medium">Txn ID</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {withdraws.map((w) => (
              <tr key={w._id} className="group hover:bg-gray-50/50 transition-colors">
                {/* ID with a muted color */}
                <td className="px-6 py-5 text-sm text-gray-400 font-mono">
                  #{w._id.slice(-6).toUpperCase()}
                </td>

                {/* User with more weight */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {w.user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="font-semibold text-gray-700">{w.user?.name}</span>
                  </div>
                </td>

                {/* Amount with bold styling */}
                <td className="px-6 py-5">
                  <span className="text-gray-900 font-bold">₹{w.amount.toLocaleString()}</span>
                </td>

                {/* Formatted Date */}
                <td className="px-6 py-5 text-gray-500 text-sm">
                  {new Date(w.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>

                {/* Status Pill Badge */}
                <td className="px-6 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${getStatusStyle(w.status)}`}>
                    {w.status}
                  </span>
                </td>

                {/* Action with a modern button */}
                <td className="px-6 py-5 text-right">
                  {w.status === "pending" ? (
                    <button
                      onClick={() => approveWithdraw(w._id)}
                      className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 shadow-sm"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-gray-300 text-xs italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {withdraws.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            No withdrawal requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawRequests;