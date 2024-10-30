const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: String,
  favoriteArtists: [String],
  favoriteGenres: [String],
  about: String,
  lookingFor: [String],
  savedItems: [String],
  recentTrades: { type: Number, default: 0 },
  recentlyViewed: [String],
  recordsListedForTrade: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  tradeCount: { type: Number, default: 0 },
  feedback: [String],
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

module.exports = mongoose.model('User', userSchema);
