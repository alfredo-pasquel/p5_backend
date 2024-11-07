require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');  // Import cors
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const s3UploadRoute = require('./routes/s3Upload');
const spotifyRoutes = require('./routes/spotifyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const tradeRoutes = require('./routes/tradeRoutes');

// console.log("AWS Access Key:", process.env.AWS_ACCESS_KEY_ID);
// console.log("AWS Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY);
// console.log("AWS Region:", process.env.AWS_REGION);

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
app.use('/api/s3', s3UploadRoute);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/trades', tradeRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
