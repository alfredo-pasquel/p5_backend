// controllers/recordController.js
const axios = require('axios');
const mongoose = require('mongoose');
const Record = require('../models/Record');
const User = require('../models/User');
const { getSpotifyAccessToken } = require('../utils/spotifyApi');

const createRecord = async (albumId, userId, imageUrls, description, shipping, condition) => {
  try {
    const token = await getSpotifyAccessToken();
    const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const albumData = albumResponse.data;
    const artistId = albumData.artists[0]?.id;
    const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Received image URLs:", imageUrls);

    // Create a new Record instance with Spotify data and provided user data
    const record = new Record({
      albumId: albumData.id,
      title: albumData.name,
      artist: albumData.artists.map((artist) => artist.name).join(', '),
      genres: artistResponse.data.genres,
      coverUrl: albumData.images[0]?.url,
      releaseDate: albumData.release_date,
      condition: condition || 'New',  // Use provided condition or default to 'New'
      description: description || '',  // Set description
      shipping: shipping || 'No Shipping',  // Set shipping method
      userId: userId,
      images: imageUrls || []
    });

    console.log("Record to be saved:", record);

    await record.save();
    
    return record;
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
};

module.exports = { createRecord };
