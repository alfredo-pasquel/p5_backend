// routes/tradeRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

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

// routes/tradeRoutes.js

// Confirm trade completion
router.post('/confirm', auth, async (req, res) => {
    const { conversationId } = req.body;
    const userId = req.user.userId;
  
    try {
      const conversation = await Message.findById(conversationId);
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
      await conversation.save();
  
      // Increment tradeCount for both users
      const participants = conversation.participants.map((id) => id.toString());
  
      const result = await User.updateMany(
        { _id: { $in: participants } },
        { $inc: { tradeCount: 1 } }
      );
  
      console.log('Trade counts updated:', result);
  
      res.status(200).json({ message: 'Trade completion confirmed' });
    } catch (error) {
      console.error('Error confirming trade completion:', error);
      res.status(500).json({ error: 'Failed to confirm trade completion' });
    }
  });
  
  module.exports = router;
  
