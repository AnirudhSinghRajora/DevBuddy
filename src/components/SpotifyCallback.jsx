import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      try {
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);

        // Get the hash without the leading #
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        console.log('Parsed params:', Object.fromEntries(params.entries()));

        // Get stored state
        const storedState = localStorage.getItem('spotify_auth_state');
        const receivedState = params.get('state');

        // Verify state
        if (!receivedState || receivedState !== storedState) {
          console.error('State mismatch. Possible CSRF attack.');
          navigate('/?error=state_mismatch');
          return;
        }

        // Clear stored state
        localStorage.removeItem('spotify_auth_state');

        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) {
          console.error('Error during Spotify authentication:', error);
          navigate(`/?error=${error}`);
          return;
        }

        if (!accessToken) {
          console.error('No access token received from Spotify');
          navigate('/?error=no_token');
          return;
        }

        // Store the access token
        const expiresIn = params.get('expires_in');
        const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiration', expirationTime.toString());

        // Navigate back to home
        navigate('/');
      } catch (error) {
        console.error('Error processing Spotify callback:', error);
        navigate('/?error=callback_error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary dark:border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Connecting to Spotify...</p>
      </div>
    </div>
  );
} 