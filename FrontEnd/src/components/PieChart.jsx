// components/PieChart.jsx
import React from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
// import './PieChart.css'; // Optional: Add your styles here

const TransactionPieChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF69B4'];

  return (
    <PieChart width={400} height={400}>
      <Tooltip />
      <Legend />
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default TransactionPieChart;
