import { useState, useEffect, useMemo } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Wallet as WalletIcon,
  User as UserIcon,
  List,
  IndianRupee,
  CreditCard,
  User,
  Menu,
  Mail,
  LogOut,
} from "lucide-react";

const AgentLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load agent info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      window.innerWidth < 1024 ? setSidebarOpen(false) : setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/agent/login");
  };

  // Sidebar menu
const menuItems = useMemo(
  () => [
    { path: "/agent/dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { path: "/agent/profile", label: "Profile", Icon: UserIcon },
    { path: "/agent/create-user", label: "Create User", Icon: UserPlus },
    { path: "/agent/transactions", label: "Transactions", Icon: List }, // points to Transactions page
    { path: "/agent/wallet", label: "Wallet", Icon: WalletIcon },
    { path: "/agent/bank-accounts", label: "Bank Accounts", Icon: CreditCard },
    { path: "/agent/commission", label: "Commission", Icon: IndianRupee },
    { path: "/agent/support", label: "Support", Icon: Mail },
  ],
  []
);

  return (
  <div className="min-h-screen bg-purple-200 flex items-center justify-center p-6">
    
    {/* Main Dashboard Container */}
    <div className="w-full max-w-[1400px] h-[90vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col
        ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 font-bold text-lg text-indigo-600">
          Agent Panel
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);

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
              <Menu size={22} />
            </button>

            <h2 className="text-lg font-semibold text-gray-800">
              Agent Dashboard
            </h2>

          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-semibold">
                {user?.name || "Agent"}
              </p>

              <p className="text-xs text-gray-500 uppercase">
                {user?.role || "Agent"}
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

          <Outlet context={{ user }} />

        </main>

      </div>

    </div>
  </div>
);
};

export default AgentLayout;