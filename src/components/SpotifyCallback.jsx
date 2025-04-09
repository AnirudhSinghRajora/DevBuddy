import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Full URL:', window.location.href);
        
        // Get URL parameters from search (not hash, since we're using code flow)
        const params = new URLSearchParams(window.location.search);
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

        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          console.error('Error during Spotify authentication:', error);
          navigate(`/?error=${error}`);
          return;
        }

        if (!code) {
          console.error('No authorization code received from Spotify');
          navigate('/?error=no_code');
          return;
        }

        // Get the code verifier from storage
        const codeVerifier = localStorage.getItem('spotify_code_verifier');
        if (!codeVerifier) {
          console.error('No code verifier found');
          navigate('/?error=no_code_verifier');
          return;
        }

        // Exchange the code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: 'f12fab314b274b8a839a42c5a99fd53d',
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${window.location.origin}/callback`,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token exchange failed:', errorData);
          navigate('/?error=token_exchange_failed');
          return;
        }

        const tokenData = await tokenResponse.json();

        // Store the tokens
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        const expirationTime = Date.now() + (tokenData.expires_in * 1000);
        localStorage.setItem('spotify_token_expiration', expirationTime.toString());

        // Clean up PKCE values
        localStorage.removeItem('spotify_code_verifier');

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