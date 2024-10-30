// models/Record.js
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  _id: String, // Use Spotify album ID as the _id field
  title: String,
  artist: String,
  albumId: String, // Spotify album ID
  genres: [String],
  coverUrl: String, // Spotify album cover
  releaseDate: String,
  condition: { type: String, enum: ['New', 'Used'], required: true },
  description: String,
  shipping: { type: String, enum: ['No Shipping', 'Local Pickup', 'US Shipping', 'International Shipping'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String], // Array to store uploaded image URLs
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

module.exports = mongoose.model('Record', recordSchema);


