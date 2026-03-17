import { Route } from "react-router-dom";
import AgentLayout from "../layouts/AgentLayout";
import AgentDashboard from "../agents/AgentDashboard";
import DepositMoney from "../agents/DepositMoney";
import CreateUser from "../pages/CreateUser";
import AgentSupport from "../agents/AgentSupport";
import WithdrawMoney from "../agents/WithdrawMoney";
import Transactions from "../agents/Transactions";
import Commission from "../agents/Commission";
import AgentWalletPage from "../agents/AgentWalletPage";
import UserProfile from "../user/UserProfile";
import AgentBankAccounts from "../agents/AgentBankAccounts";

const AgentRoutes = (
  <Route path="/agent" element={<AgentLayout />}>

    {/* Default */}
    <Route index element={<AgentDashboard />} />

    {/* Main Pages */}
    <Route path="dashboard" element={<AgentDashboard />} />
    <Route path="profile" element={<UserProfile />} />

    {/* User Actions */}
    <Route path="create-user" element={<CreateUser />} />
    <Route path="deposit" element={<DepositMoney />} />
    <Route path="withdraw" element={<WithdrawMoney />} />

    {/* Wallet Section */}
    <Route path="wallet" element={<AgentWalletPage />} />
    <Route path="bank-accounts" element={<AgentBankAccounts />} />

    {/* Transactions */}
    <Route path="transactions" element={<Transactions />} />

    {/* Commission */}
    <Route path="commission" element={<Commission />} />

    {/* Support */}
    <Route path="support" element={<AgentSupport />} />

  </Route>
);

export default AgentRoutes;