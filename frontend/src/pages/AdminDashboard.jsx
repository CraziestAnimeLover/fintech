import { useState, useEffect, useCallback, useMemo } from "react";
import { adminAPI } from "../services/api";
import { 
  Users, UserCheck, UserX, Theater, Activity, DollarSign, ArrowUpRight 
} from "lucide-react";
import Cards from "../admin/commision/Cards";
import Charts from "../admin/commision/Charts";
import Filters from "../admin/commision/Filters";
import CommissionTable from "../admin/commision/CommissionTable";

// ================= StatCard =================
const StatCard = ({ title, value, Icon, bgColor, iconColor }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex flex-col gap-6">
      <div className={`${bgColor} w-14 h-14 rounded-2xl flex items-center justify-center`}>
        <Icon className={iconColor} size={28} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);

// ================= QuickAction =================
const QuickAction = ({ href, label, Icon, bgColor, textColor, badge }) => (
  <a
    href={href}
    className={`group relative p-6 ${bgColor} rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-center gap-3 overflow-hidden`}
  >
    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <ArrowUpRight size={40} />
    </div>
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl group-hover:bg-white transition-colors shadow-sm">
      <Icon className={textColor} size={26} />
    </div>
    <p className={`font-black text-xs uppercase tracking-widest ${textColor}`}>{label}</p>
    {badge > 0 && (
      <span className="absolute top-4 right-4 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white">
        {badge}
      </span>
    )}
  </a>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    agentUsers: 0,
    totalTransactions: 0,
    pendingKyc: 0
  });
  const [commissionsSummary, setCommissionsSummary] = useState({
    total: 0,
    agentTotal: 0,
    adminTotal: 0,
    pending: 0,
    paid: 0,
    deductions: 0
  });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Admin Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      if (res.data?.success) setStats(res.data.data || {});
      else setError("Failed to load statistics");
    } catch (err) {
      console.error(err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Commissions Summary
  const fetchCommissions = useCallback(async () => {
    try {
      const res = await adminAPI.getCommissions({});
      if (res.data?.success) {
        setCommissions(res.data.data?.commissions || []);
        setCommissionsSummary(res.data.data?.summary || {});
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCommissions();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchCommissions]);

  const statCards = useMemo(
    () => [
      { id: "total", title: "Total Users", value: stats.totalUsers || 0, Icon: Users, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
      { id: "verified", title: "Verified", value: stats.verifiedUsers || 0, Icon: UserCheck, bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
      { id: "unverified", title: "Unverified", value: stats.unverifiedUsers || 0, Icon: UserX, bgColor: "bg-rose-50", iconColor: "text-rose-600" },
      { id: "agents", title: "Agents", value: stats.agentUsers || 0, Icon: Theater, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
      { id: "transactions", title: "Transactions", value: stats.totalTransactions || 0, Icon: Activity, bgColor: "bg-orange-50", iconColor: "text-orange-600" },
      {
        id: "revenue",
        title: "Total Revenue",
        value: `₹${new Intl.NumberFormat().format(commissionsSummary.total || 0)}`,
        Icon: DollarSign,
        bgColor: "bg-gray-900",
        iconColor: "text-white"
      }
    ],
    [stats, commissionsSummary]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 font-bold tracking-widest animate-pulse uppercase text-sm">
      Initializing Dashboard...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Dashboard Overview</h2>
        <p className="text-gray-400 font-medium mt-1 text-sm">
          Real-time system health, user analytics & commission revenue.
        </p>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl mb-8 font-bold text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map(card => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* Commission Charts */}
      <section className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Commission Overview</h3>
        <Charts summary={commissionsSummary} type="bar" />
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-[3rem] shadow-sm border border-gray-50 p-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Quick Actions</h3>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest border px-3 py-1 rounded-full">Admin Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            href="/admin/create-agent"
            label="Create Agent"
            Icon={Theater}
            bgColor="bg-indigo-50"
            textColor="text-indigo-700"
          />
          <QuickAction
            href="/admin/users"
            label="Manage Users"
            Icon={Users}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <QuickAction
            href="/admin/kyc-requests"
            label="Approve KYC"
            Icon={UserCheck}
            bgColor="bg-amber-50"
            textColor="text-amber-700"
            badge={stats.pendingKyc}
          />
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;