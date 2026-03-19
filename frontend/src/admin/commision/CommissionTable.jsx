import { format } from "date-fns";

const CommissionTable = ({ commissions, loading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Type</th>
            <th className="p-3">Agent</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
            <th className="p-3">Admin Share</th>
            <th className="p-3">UTR</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
          ) : commissions.length === 0 ? (
            <tr><td colSpan="7" className="text-center p-4 text-gray-500">No data found</td></tr>
          ) : (
            commissions.map(c => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{format(new Date(c.createdAt), "dd/MM/yyyy")}</td>
                <td className={`p-3 capitalize ${c.type === "admin" ? "text-purple-600" : "text-green-600"}`}>{c.type}</td>
                <td className="p-3">{c.agent?.name || "ADMIN"}</td>
                <td className="p-3 font-semibold">₹{c.amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-white text-xs ${c.status === "paid" ? "bg-green-500" : "bg-yellow-500"}`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">{c.type === "admin" ? `₹${c.amount}` : "-"}</td>
                <td className="p-3 font-mono">{c.transaction?.utr || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;