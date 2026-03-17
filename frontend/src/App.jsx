import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import UserTable from "./components/UserTable";
import CreateAdmin from "./pages/CreateAdmin";
import CreateUser from "./pages/CreateUser";
import CreateAgent from "./pages/CreateAgent";
import KYCRequests from "./pages/KYCRequests";
import AgentLogin from "./agents/AgentLogin";
import UserRoutes from "./routes/UserRoutes";
import AgentRoutes from "./routes/AgentRoutes";
import UserLogin from "./user/UserLogin";
import Deposits from "./pages/Deposits";
import WithdrawRequests from "./pages/WithdrawRequests";
import Commission from "./pages/Commission";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/user-login" element={<UserLogin />} />

        {/* Role-based Routes */}
        {user?.role === "agent" && AgentRoutes}
        {user?.role === "user" && UserRoutes}

        {/* Admin Routes */}
      {user?.role === "admin" && (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<UserTable role="user" title="Users" />} />
    <Route path="agents" element={<UserTable role="agent" title="Agents" />} />
    <Route path="deposits" element={<Deposits />} />
    <Route path="/admin/withdraws" element={<WithdrawRequests />} />
    <Route path="create-admin" element={<CreateAdmin />} />
    <Route path="create-user" element={<CreateUser />} />
    <Route path="create-agent" element={<CreateAgent />} />
    <Route path="kyc-requests" element={<KYCRequests />} />
    <Route path="commission" element={<Commission />} /> {/* <-- Added Commission */}
  </Route>
)}

        {/* Default redirect if not logged in */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;