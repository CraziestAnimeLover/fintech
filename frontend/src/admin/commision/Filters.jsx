import { X } from "lucide-react";

const Filters = ({ filters, setFilters, agents, user }) => {
  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });
  const resetFilters = () => setFilters({ agentId: "", status: "", start: "", end: "" });

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {user.role === "admin" && (
        <select name="agentId" value={filters.agentId} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Agents</option>
          {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      )}
      <select name="status" value={filters.status} onChange={handleChange} className="border p-2 rounded">
        <option value="">All Status</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
      </select>
      <input type="date" name="start" value={filters.start} onChange={handleChange} className="border p-2 rounded" />
      <input type="date" name="end" value={filters.end} onChange={handleChange} className="border p-2 rounded" />
      <button onClick={resetFilters} className="bg-gray-200 p-2 rounded flex items-center justify-center gap-1">
        <X size={16} /> Reset
      </button>
    </div>
  );
};

export default Filters;