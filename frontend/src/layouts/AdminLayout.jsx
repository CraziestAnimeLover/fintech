import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authAPI, adminAPI } from '../services/api';
import {
  Users,
  UserCheck,
  Theater,
  PlusCircle,
  Settings,
  DollarSign,
  LogOut,
  Home,Wallet,FileText
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingKyc, setPendingKyc] = useState(0); // new state
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getStats();
      if (data?.success) {
        setPendingKyc(data.data.pendingKyc || 0); // set pending KYC count
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } 
      catch (e) { console.error('Failed to parse user data'); }
    }
  }, []);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => { window.innerWidth < 1024 ? setSidebarOpen(false) : setSidebarOpen(true); };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch (err) { console.error(err); }
    finally { localStorage.clear(); navigate('/login'); }
  };

const menuItems = useMemo(() => [
  { path: '/admin', label: 'Dashboard', Icon: Home },
  { path: '/admin/users', label: 'Manage Users', Icon: Users },
  { path: '/admin/agents', label: 'Manage Agents', Icon: Theater },
  { path: '/admin/create-user', label: 'Create User', Icon: PlusCircle },
  { path: '/admin/create-agent', label: 'Create Agent', Icon: PlusCircle },
  { path: '/admin/kyc-requests', label: 'Approve KYC', Icon: UserCheck, badge: pendingKyc },

  { path: "/admin/deposits", label: "Deposits Request", Icon: Wallet },

  // ✅ ADD THIS
  { path: "/admin/withdraws", label: "Withdraw Requests", Icon: DollarSign },

  { path: "/admin/commission", label: "Commission", Icon: DollarSign },

], [pendingKyc]);

 return (
  <div className="min-h-screen bg-purple-200 flex items-center justify-center p-6">

    {/* Dashboard Container */}
    <div className="w-full max-w-[1500px] h-[92vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col
        ${sidebarOpen ? "w-64" : "w-20"}`}
      >

        {/* Logo */}
        <div className="h-16 flex items-center px-6 font-bold text-lg text-indigo-600">
          ADMIN CMS
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">

          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive
                  ? "bg-indigo-500 text-white"
                  : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <item.Icon size={20} />

                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}

                {item.badge && sidebarOpen && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

        </nav>
      </aside>

      {/* Right Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6">

          {/* Left */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h2 className="text-lg font-semibold text-gray-800">
              Admin Dashboard
            </h2>

          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-semibold">
                {user?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-500 uppercase">
                {user?.role || "Staff"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">

          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  </div>
);
};

export default AdminLayout;