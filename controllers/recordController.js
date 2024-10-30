// controllers/recordController.js
const axios = require('axios');
const Record = require('../models/Record');
const { getSpotifyAccessToken } = require('../utils/spotifyApi');

const createRecord = async (albumId, userId) => {
  try {
    const token = await getSpotifyAccessToken();
    const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const albumData = albumResponse.data;

    // Create a new Record instance with Spotify data
    const record = new Record({
      _id: albumData.id, // Spotify album ID as the MongoDB document ID
      title: albumData.name,
      artist: albumData.artists.map(artist => artist.name).join(', '),
      genres: albumData.genres,
      coverUrl: albumData.images[0]?.url,
      releaseDate: albumData.release_date,
      condition: 'New', // Default values; update if provided
      description: '',
      shipping: 'No Shipping',
      userId: userId, // Set the userId from the request
      images: []
    });

    // Save the record to the database
    await record.save();
    return record; // Return the created record for further use
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
};

module.exports = { createRecord };
