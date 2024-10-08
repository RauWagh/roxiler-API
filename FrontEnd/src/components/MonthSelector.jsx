// components/MonthSelector.jsx
import React from 'react';
import "./MonthSelector.css"
const MonthSelector = ({ selectedMonth, onMonthChange }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <select value={selectedMonth} onChange={onMonthChange}>
      {months.map((month) => (
        <option key={month} value={month}>
          {month}
        </option>
      ))}
    </select>
  );
};

export default MonthSelector;
