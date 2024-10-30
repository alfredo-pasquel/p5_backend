// routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const User = require('../models/User'); // Import User model to update user document
const auth = require('../middleware/auth'); // Authentication middleware
const { createRecord } = require('../controllers/recordController'); // Import createRecord from recordController

// POST route to create a new record listing and add it to the user's profile
router.post('/create', auth, async (req, res) => {
  const { albumId } = req.body; // Accept only albumId from frontend

  try {
    // Call createRecord to handle fetching Spotify data and saving to DB
    const newRecord = await createRecord(albumId, req.user.userId);

    // Update user's recordsListedForTrade with the new record ID
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { recordsListedForTrade: newRecord._id } }
    );

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating record listing:", error);
    res.status(500).json({ error: 'Failed to create record listing' });
  }
});

// NEW GET route to fetch a record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
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
