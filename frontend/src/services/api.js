import axios from "axios";

// ✅ Base URL WITHOUT /api
// const api = axios.create({
//   baseURL:
//     process.env.NODE_ENV === "production"
//       ? "https://v1.infycorepayment.com" // must match SSL
//       : "http://localhost:5000",         // for local dev
// });
const api = axios.create({
  baseURL:"https://fintech-6bvt.onrender.com"
            // for local dev
});

// ==============================
// INTERCEPTORS
// ==============================

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
  sendOtp: (email, role) =>
    api.post("/api/auth/send-otp", { email, role }),

  verifyOtp: (email, otp) =>
    api.post("/api/auth/verify-otp", { email, otp }),

  resendOtp: (email) =>
    api.post("/api/auth/resend-otp", { email }),

  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),

  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }),

  getMe: () =>
    api.get("/api/auth/me"),

  logout: () =>
    api.get("/api/auth/logout"),

  googleLogin: (data) =>
    api.post("/api/auth/google", data),
};

// ==============================
// ADMIN APIs
// ==============================

export const adminAPI = {
  getWithdraws: () => api.get("/api/admin/withdraw-requests"),
  approveWithdraw: (id) => api.put(`/api/admin/withdraws/${id}/approve`),
  rejectWithdraw: (id) => api.put(`/api/admin/withdraws/${id}/reject`),

  getDeposits: () => api.get("/api/admin/deposit-requests"),
  approveDeposit: (id) => api.put(`/api/admin/deposits/${id}/approve`),
  rejectDeposit: (id) => api.put(`/api/admin/deposits/${id}/reject`),

  getStats: () => api.get("/api/admin/stats"),
  getAllUsers: () => api.get("/api/admin/users"),

  createUser: (data) => api.post("/api/admin/users", data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  getCommissions: (params) => api.get("/api/commissions", { params }),
  getAgents: () => api.get("/api/agents"),

  verifyDocuments: (userId, data) =>
    api.put(`/api/admin/documents/${userId}/verify`, data),
};

// ==============================
// USER APIs
// ==============================

export const userAPI = {
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (data) => api.put("/api/users/profile", data),
  updatePassword: (data) => api.put("/api/users/password", data),

  uploadDocuments: (formData) =>
    api.post("/api/users/documents", formData),

  getDocuments: () => api.get("/api/users/documents"),
  deleteDocument: (docKey) =>
    api.delete(`/api/users/documents/${docKey}`),

  createCompany: (data) => api.post("/api/users/company", data),
  updateCompany: (data) => api.put("/api/users/company", data),
  getCompany: () => api.get("/api/users/company"),

  createCommercial: (data) =>
    api.post("/api/users/commercial", data),

  updateCommercial: (data) =>
    api.put("/api/users/commercial", data),

  getCommercial: () => api.get("/api/users/commercial"),

  getTransactions: (filters) =>
    api.get("/api/transactions", { params: filters }),

  getWallet: () => api.get("/api/users/wallet"),

  depositRequest: (data) =>
    api.post("/api/users/deposit-request", data),

  addMoney: (data) =>
    api.post("/api/wallet/add", data),

  sendMoney: (data) =>
    api.post("/api/wallet/send", data),

  withdraw: (data) =>
    api.post("/api/wallet/withdraw", data),

  getDevKeys: () => api.get("/api/developer"),
  generateDevKeys: (data) =>
    api.post("/api/developer/generate", data),

  updateDevKeys: (data) =>
    api.put("/api/developer/update", data),

  getBankAccounts: async () => {
    const res = await api.get("/api/bank/bank-accounts");
    return res.data;
  },

  addBankAccount: (data) =>
    api.post("/api/bank/bank-accounts", data),

  updateBankAccount: (id, data) =>
    api.put(`/api/bank/bank-accounts/${id}`, data),

  deleteBankAccount: (id) =>
    api.delete(`/api/bank/bank-accounts/${id}`),

  setDefaultBank: (id) =>
    api.put(`/api/bank/bank-accounts/default/${id}`),

  verifyBank: async (data) => {
    const res = await api.post("/api/bank/bank-accounts/verify", data);
    return res.data;
  },

  verifyOtp: (email, otp, role) =>
    api.post("/api/auth/verify-otp", { email, otp, role }),
};

// ==============================
// AGENT APIs
// ==============================

export const agentAPI = {
  getDashboardStats: () =>
    api.get("/api/agents/dashboard"),

  getTransactions: () =>
    api.get("/api/agents/transactions"),

  withdrawCommission: (data) =>
    api.post("/api/agents/withdraw-commission", data),

  getCommissions: (params) =>
    api.get("/api/agents/commissions", { params }),
};

export default api;