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
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },

  getAuthUrl: async () => {
    // Generate random state
    const state = Math.random().toString(36).substring(7);
    // Store state for verification
    localStorage.setItem('spotify_auth_state', state);

    // Generate and store PKCE values
    const codeVerifier = spotifyService.generateCodeVerifier();
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    const codeChallenge = await spotifyService.generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: true // Always show the auth dialog
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
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