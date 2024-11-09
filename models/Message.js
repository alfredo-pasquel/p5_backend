// models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New field
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
  tradeStatus: {
    isCompleted: { type: Boolean, default: false },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    feedbackProvided: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New field
  },
});

module.exports = mongoose.model('Message', messageSchema);
