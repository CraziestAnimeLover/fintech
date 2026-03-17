import { useState, useEffect } from "react";
import { Wallet, Users, ArrowDownUp, IndianRupee, Download } from "lucide-react";
import { agentAPI } from "../services/api"; 
import { format } from "date-fns";

// Stat Card Component
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white shadow-md rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
    <div className="bg-gray-100 p-3 rounded-lg">
      <Icon size={26} className="text-gray-700" />
    </div>
  </div>
);

const AgentDashboard = () => {
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalUsers: 0,
    transactions: 0,
    commissionEarned: 0,
    pendingCommission: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await agentAPI.getDashboardStats(); 
      if (res.data.success) {
        const data = res.data.data;
        setStats({
          walletBalance: data.walletBalance,
          totalUsers: data.totalUsers,
          transactions: data.transactionsCount,
          commissionEarned: data.commissionEarned,
          pendingCommission: data.pendingCommission, // new
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent transactions
  const fetchTransactions = async () => {
    try {
      const res = await agentAPI.getTransactions();
      if (res.data.success) {
        setTransactions(res.data.data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  // Withdraw pending commission
  const handleWithdraw = async () => {
    if (stats.pendingCommission <= 0) return alert("No pending commission to withdraw");

    setWithdrawLoading(true);
    try {
      const res = await agentAPI.withdrawCommission({ amount: stats.pendingCommission });
      if (res.data.success) {
        alert("Commission withdrawn successfully!");
        fetchStats(); // refresh stats
      } else {
        alert(res.data.message || "Failed to withdraw commission");
      }
    } catch (err) {
      console.error(err);
      alert("Error withdrawing commission");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const statCards = [
    { title: "Wallet Balance", value: `₹${stats.walletBalance}`, icon: Wallet },
    { title: "Total Users", value: stats.totalUsers, icon: Users },
    { title: "Transactions", value: stats.transactions, icon: ArrowDownUp },
    { title: "Commission Earned", value: `₹${stats.commissionEarned}`, icon: IndianRupee },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        {statCards.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>

      {/* Pending Commission Withdrawal */}
      {stats.pendingCommission > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pending Commission</p>
            <h2 className="text-xl font-bold mt-1">₹{stats.pendingCommission}</h2>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawLoading}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {withdrawLoading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Create User</button>
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">Deposit Money</button>
          <button className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700">Withdraw Money</button>
          <button className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-black">View Transactions</button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3">Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">No transactions found</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{txn.utr || txn._id}</td>
                    <td>{txn.userName || txn.user?.name}</td>
                    <td>₹{txn.amount}</td>
                    <td>{txn.method}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          txn.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : txn.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </td>
                    <td>{format(new Date(txn.createdAt), "dd/MM/yyyy")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;