import { Outlet, useOutletContext } from "react-router-dom";

const KycProtectedRoute = () => {
  const context = useOutletContext(); // get the original context
  const user = context?.user;

  if (!user) return null; // or loading spinner

  if (user.kycStatus === "pending") {
    return <Navigate to="/kyc-pending" replace />;
  }

  // ✅ Pass context down!
  return <Outlet context={context} />;
};

export default KycProtectedRoute;