import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonthSelector from './components/MonthSelector';
import TransactionTable from './components/Transactiontable';
import StatisticsBox from './components/StatisticsBox';
import TransactionBarChart from './components/BarChart';

function App() {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);
  const [statistics, setStatistics] = useState({ totalRevenue: 0, totalSold: 0, totalNotSold: 0 });
  const [barChartData, setBarChartData] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/transactions?month=March`, {
        params: { month: selectedMonth, search: searchText, page, perPage }
      });

      console.log('Transactions response:', res.data); // Debugging line
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get('/statistics', { params: { month: selectedMonth } });
      setStatistics({
        totalRevenue: res.data.totalRevenue,
        totalSold: res.data.totalSold,
        totalNotSold: res.data.totalProducts - res.data.totalSold,
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const res = await axios.get('/barchart', { params: { month: selectedMonth } });
      setBarChartData(res.data);
    } catch (err) {
      console.error('Error fetching bar chart data:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [selectedMonth, searchText, page]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div>
      <h1>Transaction Dashboard</h1>
      <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
      <input
        type="text"
        placeholder="Search Transactions"
        value={searchText}
        onChange={handleSearchChange}
      />
      <TransactionTable transactions={transactions} />
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <button disabled={page * perPage >= total} onClick={() => setPage(page + 1)}>Next</button>
      <StatisticsBox
        totalRevenue={statistics.totalRevenue}
        totalSold={statistics.totalSold}
        totalNotSold={statistics.totalNotSold}
      />
      <TransactionBarChart data={barChartData} />
    </div>
  );
}

export default App;
