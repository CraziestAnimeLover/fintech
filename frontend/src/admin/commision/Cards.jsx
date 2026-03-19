const colors = ["blue", "green", "purple", "yellow", "red"];
const titles = ["Total", "Agent Earnings", "Admin Earnings", "Pending", "Deductions"];

const Cards = ({ summary }) => {
  const values = [summary.total, summary.agentTotal, summary.adminTotal, summary.pending, summary.deductions];
  return (
    <div className="grid md:grid-cols-5 gap-4 text-center">
      {titles.map((title, i) => (
        <div key={i} className={`bg-${colors[i]}-50 p-4 rounded-lg`}>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className={`text-xl font-bold text-${colors[i]}-600`}>₹{Number(values[i] || 0).toFixed(2)}</h3>
        </div>
      ))}
    </div>
  );
};

export default Cards;