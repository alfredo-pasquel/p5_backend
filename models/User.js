const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const NotificationSchema = require ('./Notification')
const feedbackSchema = require('./Feedback');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  spotifyId: { type: String, unique: true },
  password: { type: String, required: true },
  country: String,
  favoriteArtists: [{ type: [String], default: [], set: v => v.map(artist => artist.toLowerCase()) }],
  favoriteGenres: [{ type: [String], default: [], set: v => v.map(genre => genre.toLowerCase()) }],
  about: String,
  lookingFor: [{ type: String, default: [] }], // Store Spotify album IDs
  savedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record', default: [] }],
  recentTrades: { type: Number, default: 0 },
  recentlyViewed: [String],
  recordsListedForTrade: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  tradeCount: { type: Number, default: 0 },
  feedback: [feedbackSchema],
  notifications: [NotificationSchema]
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Helper method to safely add ObjectId to recordsListedForTrade
userSchema.methods.addRecordToTradeList = function(recordId) {
  if (mongoose.Types.ObjectId.isValid(recordId)) {
    this.recordsListedForTrade.push(mongoose.Types.ObjectId(recordId));
  } else {
    throw new Error("Invalid record ID format");
  }
};

module.exports = mongoose.model('User', userSchema);
