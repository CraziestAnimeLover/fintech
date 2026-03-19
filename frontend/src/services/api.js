import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
// Create axios instance
const api = axios.create({
  baseURL: API_URL || "/api", 
  
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


// ==============================
// AUTH APIs
// ==============================

export const authAPI = {

  // Send OTP for login
  sendOtp: (email, role) =>
    api.post("/auth/send-otp", { email, role }),

  // Verify OTP
  verifyOtp: (email, otp) =>
    api.post("/auth/verify-otp", { email, otp }),

  // Resend OTP
  resendOtp: (email) =>
    api.post("/auth/resend-otp", { email }),

  // Normal login (optional)
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  // Register user
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  // Get current user
  getMe: () =>
    api.get("/auth/me"),

  // Logout
  logout: () =>
    api.get("/auth/logout"),
   googleLogin: (data) =>
    api.post("/auth/google", data),
};


// ==============================
// ADMIN APIs
// ==============================
export const adminAPI = {
  getWithdraws: () => api.get("/admin/withdraw-requests"),
  approveWithdraw: (id) => api.put(`/admin/withdraws/${id}/approve`),
  rejectWithdraw: (id) => api.put(`/admin/withdraws/${id}/reject`),
  getDeposits: () => api.get("/admin/deposit-requests"),
  approveDeposit: (id) => api.put(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id) => api.put(`/admin/deposits/${id}/reject`),
  getStats: () => api.get("/admin/stats"),
  getAllUsers: () => api.get("/admin/users"),
  createUser: (data) => api.post("/admin/users", data),
  // FIXED COMMISSIONS & AGENTS
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Admin API
getCommissions: (params) => api.get("/commissions", { params }),
getAgents: () => api.get("/agents"),
 verifyDocuments: (userId, data) =>
    api.put(`/admin/documents/${userId}/verify`, data),
};


export const userAPI = {
  // ----- User Profile -----
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  updatePassword: (data) => api.put("/users/password", data),

  // ----- Documents -----
  uploadDocuments: (formData) => api.post("/users/documents", formData),
  getDocuments: () => api.get("/users/documents"),
  deleteDocument: (docKey) => api.delete(`/users/documents/${docKey}`),

  // ----- Company -----
  createCompany: (data) => api.post("/users/company", data),
  updateCompany: (data) => api.put("/users/company", data),
  getCompany: () => api.get("/users/company"),

  // ----- Commercial -----
  createCommercial: (data) => api.post("/users/commercial", data),
  updateCommercial: (data) => api.put("/users/commercial", data),
  getCommercial: () => api.get("/users/commercial"),

  // ----- Transactions -----
  getTransactions: (filters) => api.get("/api/transactions", { params: filters }),

  // ----- Wallet -----
getWallet: () => api.get("/users/wallet"),

depositRequest: (data) => api.post("/users/deposit-request", data),

addMoney: (data) => api.post("/wallet/add", data),
sendMoney: (data) => api.post("/wallet/send", data),
withdraw: (data) => api.post("/wallet/withdraw", data),

  // ----- Developer Keys -----
  getDevKeys: () => api.get("/developer"),
  generateDevKeys: (data) => api.post("/developer/generate", data),
  updateDevKeys: (data) => api.put("/developer/update", data),

  // ----- Bank Accounts -----
// ----- Bank Accounts -----
getBankAccounts: async () => {
  const res = await api.get("/bank-accounts"); // ✅ USE api instance
  return res.data;
},
addBankAccount: (data) => api.post("/bank-accounts", data),

updateBankAccount: (id, data) =>
  api.put(`/bank-accounts/${id}`, data),

deleteBankAccount: (id) =>
  api.delete(`/bank-accounts/${id}`),

setDefaultBank: (id) =>
  api.put(`/bank-accounts/default/${id}`),

// 🔥 ADD THIS (IMPORTANT)
verifyBank: async (data) => {
  const res = await api.post("/bank-accounts/verify", data);
  return res.data;
},

  // ----- OTP Verification -----
  verifyOtp: (email, otp, role) => api.post("/auth/verify-otp", { email, otp, role }),
};

export const agentAPI = {

  getDashboardStats: () =>
    api.get("/agents/dashboard"),

  getTransactions: () =>
    api.get("/agents/transactions"),

  withdrawCommission: (data) =>
    api.post("/agents/withdraw-commission", data),

  getCommissions: (params) =>
    api.get("/agents/commissions", { params }),
};

export default api;