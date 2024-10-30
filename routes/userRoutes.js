// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Authentication middleware

// User registration route
router.post('/register', async (req, res) => {
    try {
      const { 
        username, email, password, country, 
        favoriteArtists, favoriteGenres, about, 
        lookingFor = [], savedItems = [], 
        recentTrades = 0, recentlyViewed = [], 
        recordsListedForTrade = [], tradeCount = 0, 
        feedback = [] 
      } = req.body;
  
      // Check if the user or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email is already taken' });
      }
  
      // Create a new user instance with all fields
      const newUser = new User({ 
        username, email, password, country, 
        favoriteArtists, favoriteGenres, about, 
        lookingFor, savedItems, recentTrades, 
        recentlyViewed, recordsListedForTrade, 
        tradeCount, feedback
      });
  
      await newUser.save();

      // Generate a token for the newly created user
      const payload = { userId: newUser._id, username: newUser.username, email: newUser.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: 'Error registering user' });
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
          country: user.country || "",
          about: user.about || "",
          lookingFor: user.lookingFor || [],
          savedItems: user.savedItems || [],
          recentTrades: user.recentTrades || 0,
          recentlyViewed: user.recentlyViewed || [],
          recordsListedForTrade: user.recordsListedForTrade || [],
          tradeCount: user.tradeCount || 0,
          feedback: user.feedback || []
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
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

// Get user profile by ID
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
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
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: 'Error fetching user profile' });
    }
  });

// Get user profile by ID and populate listed records
router.get('/:id', auth, async (req, res) => {
try {
    const user = await User.findById(req.params.id).populate('recordsListedForTrade'); // Populate records
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
    recordsListedForTrade: user.recordsListedForTrade, // Full record details populated
    tradeCount: user.tradeCount,
    feedback: user.feedback,
    });
} catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Error fetching user profile' });
}
});
  module.exports = router;