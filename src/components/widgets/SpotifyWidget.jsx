import { useState, useEffect } from 'react';
import { FiMusic, FiRefreshCw } from 'react-icons/fi';
import Widget from './Widget';
import { spotifyService } from '../../services/api';

export default function SpotifyWidget({ className }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setIsConnected(true);
      fetchCurrentTrack();
    }
  }, []);

  const fetchCurrentTrack = async () => {
    try {
      setIsLoading(true);
      const track = await spotifyService.getCurrentTrack();
      setCurrentTrack(track);
      setError(null);
    } catch (error) {
      console.error('Error fetching current track:', error);
      setError('Failed to fetch current track');
      if (error.message === 'No Spotify token found') {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authUrl = await spotifyService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error generating Spotify auth URL:', error);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiration');
    setIsConnected(false);
    setCurrentTrack(null);
  };

  return (
    <Widget
      title="Spotify"
      icon={<FiMusic />}
      onRefresh={isConnected ? fetchCurrentTrack : null}
      isLoading={isLoading}
      className={className}
    >
      {error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">{error}</div>
      ) : !isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your Spotify account to see what you're playing
          </p>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Connect Spotify'
            )}
          </button>
        </div>
      ) : currentTrack ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            {currentTrack.item?.album?.images?.[0]?.url && (
              <img
                src={currentTrack.item.album.images[0].url}
                alt={currentTrack.item.album.name}
                className="w-16 h-16 rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {currentTrack.item?.name || 'No track playing'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.item?.artists?.map(a => a.name).join(', ')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.item?.album?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-600 dark:text-gray-400">
          No track currently playing
        </div>
      )}
    </Widget>
  );
} 