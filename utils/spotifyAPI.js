// utils/spotifyApi.js

const axios = require('axios');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Spotify Client ID or Client Secret is not set');
  throw new Error('Spotify Client ID or Client Secret is not set');
}

const getSpotifyAccessToken = async () => {
  try {
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    const response = await axios.post('https://accounts.spotify.com/api/token', data.toString(), {
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getSpotifyAccessToken };
