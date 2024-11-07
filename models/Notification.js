// models/Notification.js

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true },
  date: { type: Date, default: Date.now },
});

module.exports = NotificationSchema;
