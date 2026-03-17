import { useState, useEffect, useMemo } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home, User, Wallet, FileText, Mail, Settings, LogOut,
  File, Building2, CreditCard, Sun, Moon
} from "lucide-react";
import KycRouteGuard from "../user/KycRouteGuard";

const UserLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");

  // Fetch latest user info from server
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user)); // update localStorage
    } catch (err) {
      console.error("Failed to fetch user:", err);
      navigate("/login");
    }
  };

  // Load user on mount
useEffect(() => {
  const userData = localStorage.getItem("user");
  if (userData) setUser(JSON.parse(userData));
  else fetchUser(); // only fetch if not in storage
}, []);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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
    navigate("/login");
  };

  const isKycPending = user?.kycStatus === "pending";

  const menuItems = useMemo(() => {
    if (isKycPending) {
      // Only allow Documents & KYC Pending page
      return [
        { path: "/user/documents", label: "Documents", Icon: File },
        { path: "/user/kyc-pending", label: "KYC Pending", Icon: FileText },
      ];
    }

    // Normal full menu
    return [
      { path: "/user/dashboard", label: "Dashboard", Icon: Home },
      { path: "/user/profile", label: "Profile", Icon: User },
      { path: "/user/wallet", label: "Wallet", Icon: Wallet },
      { path: "/user/banks", label: "Bank Accounts", Icon: CreditCard },
      { path: "/user/transactions", label: "Transactions", Icon: FileText },
      { path: "/user/documents", label: "Documents", Icon: File },
      { path: "/user/company-details", label: "Company Details", Icon: Building2 },
      { path: "/user/developer", label: "Developer", Icon: Settings },
      { path: "/user/support", label: "Support", Icon: Mail },
    ];
  }, [isKycPending, pathname]);

  if (!user) return <div className="p-6 text-center">Loading user info...</div>;

  return (
    <div className="min-h-screen bg-purple-200 flex items-center justify-center p-6">
      <div className="w-full max-w-[1400px] h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex overflow-hidden">

        {/* Sidebar */}
        <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-20"} flex flex-col`}>

          {/* Logo */}
          <div className="h-16 flex items-center px-6 font-bold text-lg text-indigo-600">
            Payd
          </div>

          {/* Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map(item => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? "bg-indigo-500 text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  <item.Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Right Side */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
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
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            <KycRouteGuard user={user}>
              <Outlet context={{ user, theme }} />
            </KycRouteGuard>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;