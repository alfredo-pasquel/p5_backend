const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');  // Import cors
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());  
// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Basic route to verify server status
app.get('/', (req, res) => {
  res.send('Vinyl Trading Backend API');
});

// User and Record routes
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
