const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors'); 
const Transaction = require('./models/Product'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

mongoose.connect('mongodb+srv://waghrau5555:TCAleHkTdYyupjo5@api.7nnx9.mongodb.net/?retryWrites=true&w=majority&appName=api')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/initialize-db', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json'); 
    const products = response.data;

    await Transaction.insertMany(products); 
    res.status(200).send('Database initialized with products.');
} catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).send('Failed to initialize database.');
}
});
app.get('/transactions', async (req, res) => {
  const { month } = req.query; // Get month from query
  if (!month) {
      return res.status(400).json({ message: 'Month is required' });
  }

  // Convert month name to number (0-11 for January-December)
  const monthMap = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12'
  };


  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(monthMapping[selected]); // Convert month name to number
    setPage(1);
  };

  try {
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching transactions' });
  }
});

app.get('/search', async (req, res) => {
  const { search = '', page = 1, perPage = 10 } = req.query;

  const query = {
      $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } }
      ]
  };

  try {
      const total = await Product.countDocuments(query);
      const transactions = await Product.find(query)
          .skip((page - 1) * perPage)
          .limit(Number(perPage));

      res.json({ total, transactions });
  } catch (error) {
      res.status(500).json({ message: 'Error searching transactions' });
  }
});



app.get('/statistics', async (req, res) => {
  try {
    const totalProducts = await Transaction.countDocuments();
    const totalSales = await Transaction.aggregate([
        {
            $match: { sold: true } 
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$price" },
                totalSold: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        totalProducts,
        totalRevenue: totalSales[0]?.totalRevenue || 0,
        totalSold: totalSales[0]?.totalSold || 0
    });
} catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Failed to fetch statistics.');
}
});


async function getBarChartData(month) {
  const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
  };

  const monthNumber = monthMap[month];
  if (monthNumber === undefined) {
      throw new Error('Invalid month');
  }

  const ranges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
  ];

  const results = ranges.map(range => ({ range: `${range.min}-${range.max}`, count: 0 }));

  try {
      const products = await Transaction.find({
          $expr: {
              $eq: [{ $month: "$dateOfSale" }, monthNumber]
          }
      });

      // Log the fetched products for debugging
      console.log('Fetched Products:', products);

      products.forEach(product => {
          for (let i = 0; i < results.length; i++) {
              const range = results[i];
              if (product.price >= range.min && product.price <= range.max) {
                  range.count++;
                  break; // Exit loop after finding the right range
              }
          }
      });

      return results;
  } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error fetching bar chart data');
  }
}

// Function to get pie chart data
async function getPieChartData(month) {
  const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
  };

  const monthNumber = monthMap[month];
  if (monthNumber === undefined) {
      throw new Error('Invalid month');
  }

  try {
      const categories = await Transaction.aggregate([
          {
              $match: {
                  $expr: {
                      $eq: [{ $month: "$dateOfSale" }, monthNumber]
                  }
              }
          },
          {
              $group: {
                  _id: "$category",
                  count: { $sum: 1 }
              }
          }
      ]);

      return categories.map(cat => ({
          category: cat._id,
          count: cat.count
      }));
  } catch (error) {
      console.error('Error fetching pie chart data:', error);
      throw new Error('Error fetching pie chart data');
  }
}

// Combined API endpoint
app.get('/combined-data', async (req, res) => {
  const month = req.query.month;

  try {
      const barChartData = await getBarChartData(month);
      const pieChartData = await getPieChartData(month);

      res.json({
          barChartData,
          pieChartData
      });
  } catch (error) {
      console.error('Error fetching combined data:', error);
      res.status(500).json({ message: 'Error fetching combined data' });
  }
});

// Endpoint for bar chart data
app.get('/barchart', async (req, res) => {
  const month = req.query.month;

  try {
      const data = await getBarChartData(month);
      res.json(data);
  } catch (error) {
      console.error('Error fetching bar chart data:', error);
      res.status(500).json({ message: 'Error fetching bar chart data' });
  }
});

// Endpoint for pie chart data
app.get('/piechart', async (req, res) => {
  const month = req.query.month;

  try {
      const data = await getPieChartData(month);
      res.json(data);
  } catch (error) {
      console.error('Error fetching pie chart data:', error);
      res.status(500).json({ message: 'Error fetching pie chart data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
