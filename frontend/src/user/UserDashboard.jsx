import { useState, useEffect } from "react";
import { Wallet, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { userAPI } from "../services/api";
import { useOutletContext } from "react-router-dom";

const UserDashboard = () => {
  const { user: contextUser, theme } = useOutletContext();
  const [user, setUser] = useState(contextUser);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (contextUser) {
        setUser(contextUser);
        setKycStatus(contextUser.status || "not_submitted");
      }

      try {
        setLoading(true);
        const res = await userAPI.getWallet(); // fetch wallet + transactions
        const txns = res.data.transactions || [];
        setTransactions(txns);

        // Compute balance considering 2% deduction for deposits
        const computedBalance = txns.reduce((sum, tx) => {
          if (tx.status !== "approved") return sum;
          if (tx.method === "deposit") return sum + Number((tx.amount * 0.98).toFixed(2));
          return sum - Number(tx.amount); // withdraw or transfer
        }, 0);

        setBalance(computedBalance);
      } catch (err) {
        console.error("Failed to fetch wallet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contextUser]);

  // Display settled amount for transactions
  const getAmountDisplay = (txn) => {
    if (txn.status !== "approved") return `₹${txn.amount}`;
    if (txn.method === "deposit") return `+₹${(txn.amount * 0.98).toFixed(2)}`;
    return `-₹${txn.amount}`;
  };

  const getAmountColor = (txn) => {
    if (txn.status !== "approved") return theme === "dark" ? "text-gray-400" : "text-gray-500";
    return txn.method === "deposit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  return (
    <div className={`min-h-screen p-6 transition-colors ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <h1 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
        Welcome back, {user?.name || user?.email}!
      </h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance */}
        <div className={`p-6 rounded-xl shadow flex items-center gap-4 transition-colors ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <Wallet className="text-blue-500" size={36} />
          <div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Wallet Balance</p>
            <p className={`text-2xl font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
              {loading ? "Loading..." : `₹${balance.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* KYC Status */}
        <div className={`p-6 rounded-xl shadow flex items-center gap-4 transition-colors ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <FileText
            className={`${
              kycStatus === "approved"
                ? "text-green-500"
                : kycStatus === "pending"
                ? "text-yellow-400"
                : "text-red-500"
            }`}
            size={36}
          />
          <div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>KYC Status</p>
            <p
              className={`text-lg font-semibold ${
                kycStatus === "approved"
                  ? "text-green-500"
                  : kycStatus === "pending"
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            >
              {kycStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl shadow flex flex-col gap-2 transition-colors ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Quick Actions</p>
          <div className="flex gap-3">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <ArrowUp size={16} /> Send
            </button>
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <ArrowDown size={16} /> Receive
            </button>
          </div>
          <a
            href={`/${user?.username}/wallet`}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-center mt-2"
          >
            Go to Wallet
          </a>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`p-6 rounded-xl shadow transition-colors ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>Recent Transactions</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className={`text-gray-400 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className={`text-gray-400 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}>No transactions yet.</p>
          ) : (
            transactions
              .slice(0, 5)
              .map((txn) => (
                <div
                  key={txn._id}
                  className={`flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        txn.method === "deposit" 
                          ? "bg-green-100 dark:bg-green-900" 
                          : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {txn.method === "deposit" ? (
                        <ArrowDown className="text-green-600 dark:text-green-400" size={18} />
                      ) : (
                        <ArrowUp className="text-red-600 dark:text-red-400" size={18} />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                        {txn.description || "Transaction"}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${getAmountColor(txn)}`}>
                    {getAmountDisplay(txn)}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;