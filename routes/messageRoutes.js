// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Start a new conversation or get existing one
router.post('/start', auth, async (req, res) => {
  const { recordId, sellerId } = req.body;
  const buyerId = req.user.userId;

  try {
    // Check if conversation already exists
    let conversation = await Message.findOne({
      recordId,
      participants: { $all: [buyerId, sellerId] },
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Message({
        recordId,
        participants: [buyerId, sellerId],
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
    const { conversationId, text } = req.body;
    const senderId = req.user.userId;
  
    try {
      const conversation = await Message.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
  
      const newMessage = {
        sender: senderId,
        text,
        readBy: [senderId], // Mark as read by the sender
      };
  
      conversation.messages.push(newMessage);
      conversation.lastUpdated = Date.now();
      await conversation.save();
  
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Mark messages as read
router.post('/conversation/:id/mark-read', auth, async (req, res) => {
    const conversationId = req.params.id;
    const userId = req.user.userId;
  
    try {
      const conversation = await Message.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
  
      // Update messages that have not been read by the user
      conversation.messages.forEach((msg) => {
        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
        }
      });
  
      await conversation.save();
  
      res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  });

// Get count of unread messages
router.get('/unread-count', auth, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const conversations = await Message.find({ participants: userId });
  
      let unreadCount = 0;
  
      conversations.forEach((conv) => {
        conv.messages.forEach((msg) => {
          if (!msg.readBy.includes(userId) && msg.sender.toString() !== userId) {
            unreadCount += 1;
          }
        });
      });
  
      res.status(200).json({ unreadCount });
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      res.status(500).json({ error: 'Failed to fetch unread messages count' });
    }
  });

// Get a specific conversation
router.get('/conversation/:id', auth, async (req, res) => {
    const conversationId = req.params.id;
  
    try {
      const conversation = await Message.findById(conversationId)
        .populate('participants', 'username')
        .populate('messages.sender', 'username')
        .populate('recordId', 'title coverUrl');
  
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
  
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });
  
  

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const conversations = await Message.find({ participants: userId })
        .populate('participants', 'username')
        .populate('recordId', 'title coverUrl')
        .populate('tradeStatus.initiatedBy', 'username')
        .sort({ lastUpdated: -1 });
  
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

// Get a specific conversation
router.get('/conversation/:id', auth, async (req, res) => {
  const conversationId = req.params.id;

  try {
    const conversation = await Message.findById(conversationId)
      .populate('participants', 'username')
      .populate('messages.sender', 'username')
      .populate('recordId', 'title coverUrl');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

router.get('/conversation/:id', auth, async (req, res) => {
    const conversationId = req.params.id;
  
    try {
      const conversation = await Message.findById(conversationId)
        .populate('participants', 'username')
        .populate('messages.sender', 'username')
        .populate('recordId', 'title coverUrl');
  
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
  
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

// Get count of unread messages and pending trade confirmations
router.get('/unread-count', auth, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const conversations = await Message.find({ participants: userId });
  
      let unreadCount = 0;
      let pendingTradeConfirmations = 0;
  
      conversations.forEach((conv) => {
        conv.messages.forEach((msg) => {
          if (!msg.readBy.includes(userId) && msg.sender.toString() !== userId) {
            unreadCount += 1;
          }
        });
  
        // Check for pending trade confirmations
        const tradeStatus = conv.tradeStatus;
        if (
          tradeStatus &&
          !tradeStatus.isCompleted &&
          tradeStatus.initiatedBy &&
          tradeStatus.initiatedBy.toString() !== userId
        ) {
          pendingTradeConfirmations += 1;
        }
      });
  
      const totalNotifications = unreadCount + pendingTradeConfirmations;
      console.log(`Unread messages for user ${userId}:`, totalNotifications);
  
      res.status(200).json({ unreadCount: totalNotifications });
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      res.status(500).json({ error: 'Failed to fetch unread messages count' });
    }
  });

module.exports = router;
