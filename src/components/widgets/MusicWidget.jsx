import { useState, useEffect } from 'react';
import { FiMusic, FiPlay, FiPause, FiSkipForward, FiSkipBack, FiSettings } from 'react-icons/fi';
import Widget from './Widget';
import { spotifyService } from '../../services/api';

export default function MusicWidget({ className }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    if (!token) {
      setShowSettings(true);
    } else {
      fetchMusicData();
    }
  }, []);

  const fetchMusicData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [trackData, playlistsData] = await Promise.all([
        spotifyService.getCurrentTrack(),
        spotifyService.getPlaylists()
      ]);

      setCurrentTrack(trackData?.item);
      setPlaylists(playlistsData);
      setIsPlaying(trackData?.is_playing || false);
    } catch (err) {
      console.error('Error fetching music data:', err);
      setError('Failed to load music data. Please check your Spotify connection.');
      if (err.message === 'No Spotify token found') {
        setShowSettings(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      await spotifyService.controlPlayback(isPlaying ? 'pause' : 'play');
      setIsPlaying(!isPlaying);
    } catch (err) {
      setError('Failed to control playback');
    }
  };

  const handleSkip = async (direction) => {
    try {
      await spotifyService.controlPlayback(direction === 'next' ? 'next' : 'previous');
      // Refresh current track data after skipping
      setTimeout(fetchMusicData, 500);
    } catch (err) {
      setError('Failed to skip track');
    }
  };

  const handleAuth = () => {
    window.location.href = spotifyService.getAuthUrl();
  };

  return (
    <Widget
      title="Coding Music"
      icon={<FiMusic />}
      onRefresh={fetchMusicData}
      isLoading={isLoading}
      className={className}
      extraActions={
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Settings"
        >
          <FiSettings className="w-4 h-4" />
        </button>
      }
    >
      {showSettings ? (
        <div className="space-y-4">
          <h4 className="font-medium">Music Settings</h4>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Spotify account to control music playback and see your playlists.
            </p>
            <button
              onClick={handleAuth}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <FiMusic className="w-4 h-4" />
              <span>Connect Spotify</span>
            </button>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">
          {error}
          <button
            onClick={fetchMusicData}
            className="ml-2 text-primary dark:text-blue-400 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Track */}
          {currentTrack ? (
            <div className="space-y-4">
              <div className="aspect-square w-full max-w-[240px] mx-auto rounded-lg overflow-hidden">
                <img
                  src={currentTrack.album.images[0]?.url}
                  alt={currentTrack.album.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center">
                <h4 className="font-medium">{currentTrack.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTrack.artists.map(a => a.name).join(', ')}
                </p>
              </div>

              {/* Playback Controls */}
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => handleSkip('previous')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <FiSkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-primary dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {isPlaying ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => handleSkip('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <FiSkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No track currently playing
            </div>
          )}

          {/* Playlists */}
          {playlists.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Your Playlists</h4>
              <div className="space-y-2">
                {playlists.map(playlist => (
                  <a
                    key={playlist.id}
                    href={playlist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {playlist.images[0] && (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="font-medium truncate">{playlist.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {playlist.tracks.total} tracks
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Widget>
  );
} 