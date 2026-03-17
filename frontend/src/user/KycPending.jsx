import { Link } from "react-router-dom";

const KycPending = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">KYC Under Review</h2>
        <p className="text-gray-600 mb-6">
          Your submitted documents are currently under review by our team. 
          You will be notified once your KYC is approved.
        </p>
        {/* <Link 
          to="/documents" 
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Your Documents
        </Link> */}
      </div>
    </div>
  );
};

export default KycPending;