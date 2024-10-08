import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]); // Store all transactions for sorting/filtering
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch all transactions on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/transactions?month=January');
                setTransactions(response.data); // Set the fetched transactions
                setAllTransactions(response.data); // Store all transactions
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Ensure loading is false at the end
            }
        };

        fetchData();
    }, []);

    // Convert month name to its numeric value
    const getMonthNumber = (monthName) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames.indexOf(monthName) + 1; // Return 1-based month number
    };

    // Filter transactions based on selected month
    const handleMonthChange = (selectedMonth) => {
        setMonth(selectedMonth);

        // Convert selectedMonth to month number
        const monthNumber = getMonthNumber(selectedMonth);

        // Filter transactions by month
        const filteredTransactions = allTransactions.filter(transaction => {
            const date = new Date(transaction.dateOfSale);
            const transactionMonth = date.getMonth() + 1; // Extract the month (0 = January, so +1)
            return transactionMonth === monthNumber;
        });

        setTransactions(filteredTransactions); // Update transactions with filtered data
    };

    // Render the table
    return (
        <div>
            <h1>Product Data</h1>
            <select onChange={(e) => handleMonthChange(e.target.value)} defaultValue="">
                <option value="" disabled>Select a month</option>
                {/* Generate month options dynamically */}
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Sold</th>
                            <th>Date of Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.id}</td>
                                    <td>{transaction.title}</td>
                                    <td>{transaction.description}</td>
                                    <td>${transaction.price.toFixed(2)}</td> {/* Format price as currency */}
                                    <td>{transaction.category}</td>
                                    <td>{transaction.sold ? 'Yes' : 'No'}</td>
                                    <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No data available for {month}</td> {/* Show specific month message */}
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DataTable;
