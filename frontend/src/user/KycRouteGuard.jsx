import { Navigate, useLocation } from "react-router-dom";
import KycPending from "./KycPending";

const KycRouteGuard = ({ user, children }) => {
  const location = useLocation();

  if (!user) return <div> <KycPending/></div>; // or loading spinner
  if (user.kycStatus === "pending") {
    // Allow only /documents and /kyc-pending
    if (
      location.pathname.endsWith("/documents") ||
      location.pathname.endsWith("/kyc-pending")
    ) {
      return children;
    } else {
      return <Navigate to={`/${user.username}/kyc-pending`} replace />;
    }
  }

  return children;
};

export default KycRouteGuard;