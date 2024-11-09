// routes/tradeRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Record = require('../models/Record')

// Initiate trade completion
router.post('/initiate', auth, async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user.userId;

  try {
    const conversation = await Message.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.tradeStatus && conversation.tradeStatus.isCompleted) {
      return res.status(400).json({ error: 'Trade already completed' });
    }

    // Update tradeStatus
    conversation.tradeStatus = {
      initiatedBy: userId,
    };
    await conversation.save();

    // Send notification to the other user (Implement notification logic as needed)
    // ...

    res.status(200).json({ message: 'Trade completion initiated' });
  } catch (error) {
    console.error('Error initiating trade completion:', error);
    res.status(500).json({ error: 'Failed to initiate trade completion' });
  }
});

// Confirm trade completion
router.post('/confirm', auth, async (req, res) => {
    const { conversationId } = req.body;
    const userId = req.user.userId;
  
    try {
      // Populate 'recordId' to access the associated record
      const conversation = await Message.findById(conversationId).populate('recordId');
  
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
  
      if (conversation.tradeStatus.isCompleted) {
        return res.status(400).json({ error: 'Trade already completed' });
      }
  
      if (!conversation.tradeStatus.initiatedBy) {
        return res.status(400).json({ error: 'Trade completion not initiated' });
      }
  
      if (conversation.tradeStatus.initiatedBy.toString() === userId) {
        return res.status(400).json({ error: 'You cannot confirm your own initiation' });
      }
  
      // Update tradeStatus
      conversation.tradeStatus.confirmedBy = userId;
      conversation.tradeStatus.isCompleted = true;
      conversation.tradeStatus.feedbackPending = true;
      await conversation.save();
  
      // Increment tradeCount for both users
      const participants = conversation.participants.map((id) => id.toString());
  
      await User.updateMany(
        { _id: { $in: participants } },
        { $inc: { tradeCount: 1 } }
      );
  
      // Mark the record as traded
      const recordId = conversation.recordId._id;
      await Record.findByIdAndUpdate(recordId, { isTraded: true });
  
      // Remove the record from the seller's recordsListedForTrade
      const sellerId = conversation.recordId.userId;
      await User.findByIdAndUpdate(sellerId, {
        $pull: { recordsListedForTrade: recordId },
      });
  
      res.status(200).json({ message: 'Trade completion confirmed' });
    } catch (error) {
      console.error('Error confirming trade completion:', error);
      res.status(500).json({ error: 'Failed to confirm trade completion' });
    }
  });

// Submit feedback
router.post('/feedback', auth, async (req, res) => {
    const { conversationId, rating, comment } = req.body;
    const userId = req.user.userId;
  
    try {
      const conversation = await Message.findById(conversationId).populate('participants');
  
      if (!conversation || !conversation.tradeStatus.isCompleted) {
        return res.status(400).json({ error: 'Trade not completed or conversation not found' });
      }
  
      if (conversation.tradeStatus.feedbackProvided?.includes(userId)) {
        return res.status(400).json({ error: 'Feedback already provided by this user' });
      }
  
      // Identify the other participant
      const otherUserId = conversation.participants.find(
        (participant) => participant._id.toString() !== userId
      )._id;
  
      // Add feedback to the other user
      const otherUser = await User.findById(otherUserId);
      otherUser.feedback.push({
        fromUser: userId,
        rating,
        comment,
      });
      await otherUser.save();
  
      // Update the conversation to indicate feedback has been provided
      conversation.tradeStatus.feedbackProvided = conversation.tradeStatus.feedbackProvided || [];
      conversation.tradeStatus.feedbackProvided.push(userId);
      await conversation.save();
  
      res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });
  
  
  module.exports = router;
  
