// controllers/recordController.js

const axios = require('axios');
const mongoose = require('mongoose');
const Record = require('../models/Record');
const User = require('../models/User');
const { getSpotifyAccessToken } = require('../utils/spotifyAPI');

const createRecord = async (recordData) => {
  try {
    let spotifyData = {};

    // If albumId is provided, fetch data from Spotify
    if (recordData.albumId) {
      const token = await getSpotifyAccessToken();
      const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${recordData.albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const albumData = albumResponse.data;
      const artistId = albumData.artists[0]?.id;
      const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      spotifyData = {
        title: albumData.name,
        artist: albumData.artists.map((artist) => artist.name),
        genres: artistResponse.data.genres,
        coverUrl: albumData.images[0]?.url,
        releaseDate: albumData.release_date,
      };
    }

    // Combine user-provided data with Spotify data (user data takes precedence)
    const combinedData = {
      ...spotifyData,
      ...recordData,
    };

    // Ensure 'artist' is always an array
    if (typeof combinedData.artist === 'string') {
      combinedData.artist = combinedData.artist.split(',').map((artist) => artist.trim());
    }

    // Ensure 'genres' is always an array
    if (typeof combinedData.genres === 'string') {
      combinedData.genres = combinedData.genres.split(',').map((genre) => genre.trim());
    }

    const record = new Record(combinedData);
    await record.save();

    // Notify users who are looking for this album
    if (record.albumId) {
      const usersLookingFor = await User.find({ lookingFor: record.albumId });
      const notification = {
        type: 'LookingForMatch',
        message: `The album "${record.title}" you are looking for has been listed.`,
        recordId: record._id,
        date: new Date(),
      };
      for (const user of usersLookingFor) {
        user.notifications.push(notification);
        await user.save();
      }
    }

    return record;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
};

module.exports = { createRecord };
