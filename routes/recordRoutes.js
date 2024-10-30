// routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const User = require('../models/User'); // Import User model to update user document
const auth = require('../middleware/auth'); // Authentication middleware

// POST route to create a new record listing and add it to the user's profile
router.post('/create', auth, async (req, res) => {
  const { title, artist, albumId, genres, coverUrl, releaseDate, condition, description, shipping } = req.body;
  
  try {
    const newRecord = new Record({
      title,
      artist,
      albumId,
      genres,
      coverUrl,
      releaseDate,
      condition,
      description,
      shipping,
      userId: req.user.userId // Use userId from decoded token
    });

    // Save the new record to the database
    await newRecord.save();

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

module.exports = router;
