import { Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";

import Dashboard from "../user/UserDashboard";
import UserProfile from "../user/UserProfile";
import Documents from "../user/Documents";
import CompanyDetails from "../user/CompanyDetails";
import Commercial from "../user/Commercial";
import Developer from "../user/DeveloperSettings";
import KycPending from "../user/KycPending";
import Wallet from "../user/Wallet";
import BankAccounts from "../user/BankAccounts";
import Transactions from "../user/Transactions";
import Transfer from "../user/Transfer";
import Payouts from "../user/Payouts";
import SupportSection from "../user/SupportSection";

const UserRoutes = (
  <Route path="/:username" element={<UserLayout />}>

    {/* KYC Pages accessible even if pending */}
    <Route path="documents" element={<Documents />} />
    <Route path="kyc-pending" element={<KycPending />} />

    {/* Protected routes (KYC approved only) */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="profile" element={<UserProfile />} />
    <Route path="wallet" element={<Wallet />} />
    <Route path="banks" element={<BankAccounts />} />
    <Route path="transactions" element={<Transactions />} />
    <Route path="transfer" element={<Transfer />} />
    <Route path="payouts" element={<Payouts />} />
    <Route path="company-details" element={<CompanyDetails />} />
    <Route path="commercial" element={<Commercial />} />
    <Route path="developer" element={<Developer />} />
    <Route path="support" element={<SupportSection />} />

  </Route>
);

export default UserRoutes;