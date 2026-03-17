import { useEffect, useState } from "react";
import { adminAPI } from "../services/api";

const WithdrawRequests = () => {

  const [withdraws, setWithdraws] = useState([]);

  const fetchWithdraws = async () => {
    const res = await adminAPI.getWithdraws();
    setWithdraws(res.data.withdraws);
  };

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const approveWithdraw = async (id) => {
    await adminAPI.approveWithdraw(id);
    fetchWithdraws();
  };

  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4">
        Withdraw Requests
      </h2>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">
            <th className="p-3">Txn ID</th>
            <th className="p-3">User</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>

        </thead>

        <tbody>

          {withdraws.map((w) => (

            <tr key={w._id} className="border-t">

              <td className="p-3">{w._id.slice(-6)}</td>
              <td className="p-3">{w.user?.name}</td>
              <td className="p-3 font-semibold">₹{w.amount}</td>
              <td className="p-3">
                {new Date(w.createdAt).toLocaleDateString()}
              </td>

              <td className="p-3">
                {w.status}
              </td>

              <td className="p-3">

                {w.status === "pending" && (

                  <button
                    onClick={() => approveWithdraw(w._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
};

export default WithdrawRequests;