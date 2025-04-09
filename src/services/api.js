import axios from 'axios';

// Create reusable axios instances for different APIs
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

const codeforceAPI = axios.create({
  baseURL: 'https://codeforces.com/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

const weatherAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Spotify API configuration
const SPOTIFY_CLIENT_ID = 'f12fab314b274b8a839a42c5a99fd53d';
// Use the current origin (will work with both local and ngrok URLs)
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/callback`;
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private'
].join(' ');

// GitHub API services
export const githubService = {
  getUserProfile: async (username) => {
    try {
      const response = await githubAPI.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub user profile:', error);
      throw new Error('User not found or GitHub API rate limit exceeded');
    }
  },
  
  getUserRepos: async (username) => {
    try {
      const response = await githubAPI.get(`/users/${username}/repos`, {
        params: {
          sort: 'updated',
          per_page: 5
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw new Error('Unable to fetch repositories');
    }
  },
};

// Codeforces API services
export const codeforceService = {
  getUserProfile: async (handle) => {
    try {
      const response = await codeforceAPI.get(`/user.info?handles=${handle}`);
      return response.data.result[0];
    } catch (error) {
      console.error('Error fetching Codeforces user profile:', error);
      throw new Error('User not found or Codeforces API error');
    }
  },
  
  getContests: async () => {
    try {
      const response = await codeforceAPI.get('/contest.list');
      // Filter to only get upcoming contests
      return response.data.result
        .filter(contest => contest.phase === 'BEFORE')
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error);
      throw new Error('Unable to fetch contests');
    }
  },
};

// Weather API services
export const weatherService = {
  getWeatherByCity: async (city) => {
    try {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('OpenWeather API key not found. Please add your API key.');
      }
      
      const response = await weatherAPI.get(`/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeather API key.');
        } else if (error.response.status === 404) {
          throw new Error(`City "${city}" not found. Please check the city name and try again.`);
        } else if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Weather API error: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from weather service. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error setting up weather request: ${error.message}`);
      }
    }
  },
};

// Spotify API services
export const spotifyService = {
  getAuthUrl: () => {
    return `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}`;
  },

  getCurrentTrack: async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) throw new Error('No Spotify token found');

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 204) {
        return null; // No track currently playing
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current track:', error);
      throw new Error('Failed to fetch current track');
    }
  },

  getPlaylists: async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) throw new Error('No Spotify token found');

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw new Error('Failed to fetch playlists');
    }
  },

  controlPlayback: async (action) => {
    const token = localStorage.getItem('spotify_token');
    if (!token) throw new Error('No Spotify token found');

    try {
      await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error controlling playback:', error);
      throw new Error('Failed to control playback');
    }
  }
}; 