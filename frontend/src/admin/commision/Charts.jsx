import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Charts = ({ summary }) => {
  // Mapping your data to the chart
  const barData = [
    { name: "Total", value: summary.total },
    { name: "Agent", value: summary.agentTotal },
    { name: "Admin", value: summary.adminTotal },
    { name: "Pending", value: summary.pending },
    { name: "Deductions", value: summary.deductions },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-3xl shadow-sm border border-gray-50">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Horizontal dashed lines only */}
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#0c0c0c" 
            />
            
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={10}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            
    <Tooltip
  cursor={{ fill: "transparent" }}
  contentStyle={{ 
    borderRadius: "12px", 
    border: "none", 
    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    padding: "10px"
  }}
  // This changes the color of the value text to black
  itemStyle={{ color: "#000000", fontWeight: "600" }} 
  // This changes the color of the label (e.g., "Admin", "Total") to black
  labelStyle={{ color: "#000000", marginBottom: "4px" }} 
/>

            {/* The "Magic" styling: fill color and radius */}
            <Bar
              dataKey="value"
              fill="#E9D5FF" // That soft lavender/purple from the image
              radius={[6, 6, 0, 0]} // Rounded top corners
              barSize={40} // Adjust width to match the "chunky" look
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;