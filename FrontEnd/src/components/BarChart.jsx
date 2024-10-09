import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import "./Barchart.css";

const TransactionBarChart = ({ data }) => {
  return (
    <BarChart width={800} height={400} data={data}> {/* Adjusted size */}
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
};

export default TransactionBarChart;
