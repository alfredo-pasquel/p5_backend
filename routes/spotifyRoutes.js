// routes/spotifyRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getSpotifyAccessToken } = require('../utils/spotifyAPI');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Route to search albums
router.get('/search', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const query = req.query.q;

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: 'album',
        limit: 5,
      },
    });

    const albums = response.data?.albums?.items || [];
    res.json(albums);
  } catch (error) {
    console.error('Error searching Spotify albums:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search Spotify albums' });
  }
});

// Route to get album details
router.get('/album/:id', async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const albumId = req.params.id;

    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching album details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch album details' });
  }
});

// Route to handle Spotify authorization callback
router.post('/callback', async (req, res) => {
    const { code } = req.body;
  
    try {
      // Exchange the authorization code for an access token
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
  
      const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      const accessToken = tokenResponse.data.access_token;
      const refreshToken = tokenResponse.data.refresh_token;
  
      // Fetch the user's Spotify profile
      const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const spotifyUserData = userResponse.data;
  
      // Find or create a user in your database
      let user = await User.findOne({ spotifyId: spotifyUserData.id });
  
      if (!user) {
        // Create a new user
        user = new User({
          spotifyId: spotifyUserData.id,
          username: spotifyUserData.display_name || spotifyUserData.id,
          email: spotifyUserData.email,
          spotifyAccessToken: accessToken,
          spotifyRefreshToken: refreshToken,
        });
  
        await user.save();
      } else {
        // Update existing user's tokens
        user.spotifyAccessToken = accessToken;
        user.spotifyRefreshToken = refreshToken;
        await user.save();
      }
  
      // Generate a JWT token for your application
      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Send the token and user data back to the frontend
      res.status(200).json({ token: jwtToken, user });
    } catch (error) {
      console.error('Error during Spotify authentication:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to authenticate with Spotify' });
    }
  });  

router.get('/artist/:id', async (req, res) => {
    try {
      const token = await getSpotifyAccessToken();
      const artistId = req.params.id;
  
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching artist details:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch artist details' });
    }
  });

module.exports = router;
