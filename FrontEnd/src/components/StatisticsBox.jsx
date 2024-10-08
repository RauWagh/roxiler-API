// components/StatisticsBox.jsx
import React from 'react';
import "./StatisticsBox.css"

const StatisticsBox = ({ totalRevenue, totalSold, totalNotSold }) => {
  return (
    <div>
      <h2>Statistics</h2>
      <p>Total Revenue: {totalRevenue}</p>
      <p>Total Sold: {totalSold}</p>
      <p>Total Not Sold: {totalNotSold}</p>
    </div>
  );
};

export default StatisticsBox;
