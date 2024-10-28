const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  releaseDate: { type: String },
  genre: { type: String },
  coverUrl: { type: String },
  spotifyUrl: { type: String },
  condition: { type: String, enum: ['new', 'used'], default: 'used' },
  price: { type: Number },
  availability: { type: String, enum: ['for sale', 'for trade', 'looking for'] },
});

module.exports = mongoose.model('Record', recordSchema);
