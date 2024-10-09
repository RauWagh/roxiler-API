import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios to make API requests
import TransactionBarChart from './BarChart'; // Import your BarChart component
import TransactionPieChart from './PieChart'; // Import your PieChart component
import "./TransactionTable.css"; // CSS for the transaction table
import "./Barchart.css"; // CSS for the bar chart

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]); // State to store transactions
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error handling
  const [showBarChart, setShowBarChart] = useState(false); // State to toggle bar chart visibility
  const [showPieChart, setShowPieChart] = useState(false); // State to toggle pie chart visibility
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [transactionsPerPage] = useState(10); // Number of transactions per page
  const [selectedMonth, setSelectedMonth] = useState('March'); // Default month

  // Fetch transactions from the API when the component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/transactions?month=${selectedMonth}`);
        setTransactions(response.data); // Store the fetched data in state
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        setError('Error fetching transactions');
        setLoading(false);
      }
    };

    fetchTransactions(); // Call the fetch function
  }, [selectedMonth]); // Fetch data when selectedMonth changes

  // Prepare data for Bar Chart
  const prepareBarChartData = () => {
    return transactions.map(transaction => ({
      name: new Date(transaction.dateOfSale).toLocaleDateString(),
      value: transaction.price,
    }));
  };

  // Prepare data for Pie Chart
  const preparePieChartData = () => {
    const data = transactions.reduce((acc, transaction) => {
      const type = transaction.category || 'Unknown';
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }
      acc[type].value += 1; // Count the number of transactions per type
      return acc;
    }, {});
    return Object.values(data);
  };

  // Handle loading state
  if (loading) {
    return <p>Loading transactions...</p>;
  }

  // Handle error state
  if (error) {
    return <p>{error}</p>;
  }

  // Pagination Logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  return (
    <div>
      <h2>Transaction Table</h2>
      {currentTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                <td>{transaction.price}</td>
                <td>{transaction.sold ? 'Sold' : 'Available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        )}
        <span>{currentPage}</span>
        {currentPage < totalPages && (
          <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        )}
      </div>

      {/* Toggle Buttons for Charts */}
      <div>
        <button onClick={() => setShowBarChart(prev => !prev)}>Toggle Bar Chart</button>
        <button onClick={() => setShowPieChart(prev => !prev)}>Toggle Pie Chart</button>
      </div>

      {/* Render the bar chart below the table */}
      {showBarChart && (
        <div>
          <h3 className="chart-title">Transaction Amounts by Month</h3>
          <TransactionBarChart data={prepareBarChartData()} />
        </div>
      )}

      {/* Render the pie chart below the bar chart */}
      {showPieChart && (
        <div>
          <h3 className="chart-title">Transaction Type Distribution</h3>
          <TransactionPieChart data={preparePieChartData()} />
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
