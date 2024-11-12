// routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const User = require('../models/User'); // Import User model to update user document
const auth = require('../middleware/auth'); // Authentication middleware
const { createRecord } = require('../controllers/recordController'); // Import createRecord from recordController

// GET route to fetch all records for displaying on the homepage
router.get('/', async (req, res) => {
    try {
      const records = await Record.find().sort({ timestamp: -1 }); // Sort by latest
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  });

// POST route to create a new record listing and add it to the user's profile
router.post('/create', auth, async (req, res) => {
    try {
      const recordData = {
        ...req.body,
        userId: req.user.userId,
      };
  
      const newRecord = await createRecord(recordData);
  
      // Update user's recordsListedForTrade with the new record ID
      await User.findByIdAndUpdate(
        req.user.userId,
        { $push: { recordsListedForTrade: newRecord._id } }
      );
  
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating record listing:', error);
      res.status(500).json({ error: 'Failed to create record listing' });
    }
  });

// DELETE route to delete a record listing
router.delete('/delete/:id', auth, async (req, res) => {
    const { id } = req.params;
    
    try {
      // Find and delete the record
      const record = await Record.findByIdAndDelete(id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
  
      // Remove the record ID from the user's `recordsListedForTrade`
      await User.findByIdAndUpdate(req.user.userId, { $pull: { recordsListedForTrade: id } });
  
      res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

// Get a record by ID and include seller information
router.get('/:id', async (req, res) => {
    try {
      const record = await Record.findById(req.params.id)
        .populate('userId', 'username tradeCount feedback');
  
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json(record);
    } catch (error) {
      console.error("Error fetching record:", error);
      res.status(500).json({ error: 'Failed to fetch record' });
    }
  });

// Append an image URL to the images array of a specific record
router.post('/:id/add-image', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const record = await Record.findByIdAndUpdate(id, { $push: { images: imageUrl } }, { new: true });
    if (!record) return res.status(404).json({ error: 'Record not found' });

    res.status(200).json(record);
  } catch (error) {
    console.error('Error adding image to record:', error);
    res.status(500).json({ error: 'Failed to add image to record' });
  }
});

module.exports = router;
