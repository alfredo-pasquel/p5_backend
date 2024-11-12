// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Record = require('../models/Record');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// User registration route
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      country,
      favoriteArtists,
      favoriteGenres,
      about,
      lookingFor = [],
      savedItems = [],
      recentTrades = 0,
      recentlyViewed = [],
      recordsListedForTrade = [],
      tradeCount = 0,
      feedback = [],
    } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if the username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
    }

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password,
      country,
      favoriteArtists,
      favoriteGenres,
      about,
      lookingFor,
      savedItems,
      recentTrades,
      recentlyViewed,
      recordsListedForTrade,
      tradeCount,
      feedback,
    });

    await newUser.save();

    // Generate token
    const payload = {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ error: messages.join('. ') });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyValue.username) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      if (error.keyValue.email) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
    }

    return res.status(500).json({ error: 'Error registering user' });
  }
});

// User login route with full response data
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    console.log('Login attempt:', req.body);

    const isEmail = typeof identifier === 'string' && identifier.includes('@');
    const user = await User.findOne(isEmail ? { email: identifier } : { username: identifier });

    if (!user) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    const payload = { userId: user._id, username: user.username, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        favoriteArtists: user.favoriteArtists || [],
        favoriteGenres: user.favoriteGenres || [],
        country: user.country || '',
        about: user.about || '',
        lookingFor: user.lookingFor || [],
        savedItems: user.savedItems || [],
        recentTrades: user.recentTrades || 0,
        recentlyViewed: user.recentlyViewed || [],
        recordsListedForTrade: user.recordsListedForTrade || [],
        tradeCount: user.tradeCount || 0,
        feedback: user.feedback || [],
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error logging in user' });
  }
});

// User logout route
router.post('/logout', (req, res) => {
  try {
    res.status(200).json({ message: 'Sign out successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error signing out' });
  }
});

// Save a record
router.post('/save', auth, async (req, res) => {
  const { recordId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { savedItems: recordId } },
      { new: true }
    );
    res.status(200).json({ message: 'Record saved', savedItems: user.savedItems });
  } catch (error) {
    console.error('Error saving record:', error);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// Unsave a record
router.post('/unsave', auth, async (req, res) => {
  const { recordId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { savedItems: recordId } },
      { new: true }
    );
    res.status(200).json({ message: 'Record unsaved', savedItems: user.savedItems });
  } catch (error) {
    console.error('Error unsaving record:', error);
    res.status(500).json({ error: 'Failed to unsave record' });
  }
});

// Add to "Looking For" list
router.post('/add-looking-for', auth, async (req, res) => {
  const { albumId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { lookingFor: albumId } },
      { new: true }
    );
    res.status(200).json({ message: 'Album added to Looking For list', lookingFor: user.lookingFor });
  } catch (error) {
    console.error('Error adding to Looking For:', error);
    res.status(500).json({ error: 'Failed to add to Looking For list' });
  }
});

// Remove from "Looking For" list
router.post('/remove-looking-for', auth, async (req, res) => {
  const { albumId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { lookingFor: albumId } },
      { new: true }
    );
    res.status(200).json({ message: 'Album removed from Looking For list', lookingFor: user.lookingFor });
  } catch (error) {
    console.error('Error removing from Looking For:', error);
    res.status(500).json({ error: 'Failed to remove from Looking For list' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user notifications
router.get('/:id/notifications', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const user = await User.findById(req.params.id);
    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Recommendation route using auth middleware
router.get('/recommendations', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const favoriteGenresLower = user.favoriteGenres
        .flat()
        .filter((genre) => typeof genre === 'string')
        .map((genre) => genre.toLowerCase());
  
      const favoriteArtistsLower = user.favoriteArtists
        .flat()
        .filter((artist) => typeof artist === 'string')
        .map((artist) => artist.toLowerCase());
  
      // Fetch all records that match any genre or artist, including images
      const potentialRecords = await Record.find({}, 'title artist genres coverUrl albumId images');
  
      // Filter results manually for nested arrays in artist and genres
      const recommendedRecords = potentialRecords.filter((record) => {
        // Flatten and lowercase genres and artist arrays for each record
        const recordGenresLower = record.genres.flat().map((g) => g.toLowerCase());
        const recordArtistsLower = record.artist.flat().map((a) => a.toLowerCase());
  
        // Check if any genre or artist matches the user's preferences
        const matchesGenre = recordGenresLower.some((genre) => favoriteGenresLower.includes(genre));
        const matchesArtist = recordArtistsLower.some((artist) => favoriteArtistsLower.includes(artist));
  
        return matchesGenre || matchesArtist;
      });
  
      console.log('Recommended Records with images:', recommendedRecords);
      res.json(recommendedRecords);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });  

// Get user profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('recordsListedForTrade');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      country: user.country,
      about: user.about,
      favoriteArtists: user.favoriteArtists,
      favoriteGenres: user.favoriteGenres,
      lookingFor: user.lookingFor,
      savedItems: user.savedItems,
      recentTrades: user.recentTrades,
      recentlyViewed: user.recentlyViewed,
      recordsListedForTrade: user.recordsListedForTrade,
      tradeCount: user.tradeCount,
      feedback: user.feedback,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Get public user information by ID
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username tradeCount feedback') // Select only the fields we want to expose
      .populate('feedback.fromUser', 'username'); // Populate the fromUser field in feedback

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      tradeCount: user.tradeCount,
      feedback: user.feedback,
    });
  } catch (error) {
    console.error('Error fetching public user info:', error);
    res.status(500).json({ error: 'Error fetching user information' });
  }
});

module.exports = router;
