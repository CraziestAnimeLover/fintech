import { useState, useEffect, useCallback, useMemo } from "react";
import { adminAPI } from "../services/api";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  User,
  Theater,
  PlusCircle,
  Settings,
  Activity,
  DollarSign,
  CreditCard
} from "lucide-react";

const StatCard = ({ title, value, Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div
        className={`${color} w-14 h-14 rounded-full flex items-center justify-center`}
      >
        <Icon className="text-white" size={26} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    agentUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    systemBalance: 0,
    pendingKyc: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getStats();
      if (data?.success) {
        setStats(data.data);
      } else {
        setError("Failed to load statistics");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Optional: refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

const statCards = useMemo(
  () => [
    { id: "total", title: "Total Users", value: stats.totalUsers || 0, Icon: Users, color: "bg-blue-500" },
    { id: "verified", title: "Verified Users", value: stats.verifiedUsers || 0, Icon: UserCheck, color: "bg-green-500" },
    { id: "unverified", title: "Unverified Users", value: stats.unverifiedUsers || 0, Icon: UserX, color: "bg-yellow-500" },
    // { id: "admins", title: "Admins", value: stats.adminUsers || 0, Icon: Shield, color: "bg-purple-500" },
    { id: "agents", title: "Agents", value: stats.agentUsers || 0, Icon: Theater, color: "bg-pink-500" },
    { id: "users", title: "Regular Users", value: stats.regularUsers || 0, Icon: User, color: "bg-indigo-500" },
    // Financial Layer
    { id: "transactions", title: "Total Transactions", value: stats.totalTransactions || 0, Icon: Activity, color: "bg-orange-500" },
    { 
      id: "revenue", 
      title: "Total Revenue", 
      value: `₹${new Intl.NumberFormat().format(stats.totalRevenue || 0)}`, 
      Icon: DollarSign, 
      color: "bg-emerald-600" 
    },
    { 
      id: "system-balance", 
      title: "System Float", 
      value: `₹${new Intl.NumberFormat().format(stats.systemBalance || 0)}`, 
      Icon: CreditCard, 
      color: "bg-red-500" 
    },
  ],
  [stats]
);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* <a
            href="/admin/create-admin"
            className="p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition text-center"
          >
            <Shield className="mx-auto text-purple-700" size={28} />
            <p className="mt-2 font-medium text-purple-800">Create Admin</p>
          </a> */}

          <a
            href="/admin/create-agent"
            className="p-4 bg-pink-100 rounded-lg hover:bg-pink-200 transition text-center"
          >
            <Theater className="mx-auto text-pink-700" size={28} />
            <p className="mt-2 font-medium text-pink-800">Create Agent</p>
          </a>

          <a
            href="/admin/users"
            className="p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition text-center"
          >
            <Users className="mx-auto text-blue-700" size={28} />
            <p className="mt-2 font-medium text-blue-800">Manage Users</p>
          </a>

          {/* Fintech-specific Quick Actions */}
          <a
            href="/admin/kyc-requests"
            className="p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition text-center relative"
          >
            <UserCheck className="mx-auto text-yellow-700" size={28} />
            <p className="mt-2 font-medium text-yellow-800">Approve KYC</p>
            {stats.pendingKyc > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingKyc}
              </span>
            )}
          </a>

          {/* <a
            href="/admin/transaction-logs"
            className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-center"
          >
            <Settings className="mx-auto text-gray-700" size={28} />
            <p className="mt-2 font-medium text-gray-800">System Logs</p>
          </a> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;