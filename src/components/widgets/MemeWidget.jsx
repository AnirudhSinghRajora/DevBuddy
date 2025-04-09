import { useState, useEffect } from 'react';
import { FiSmile, FiThumbsUp, FiThumbsDown, FiRefreshCw } from 'react-icons/fi';
import Widget from './Widget';

export default function MemeWidget({ className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setLiked(false);
    setDisliked(false);

    try {
      const response = await fetch('https://meme-api.com/gimme/ProgrammerHumor');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Check if the response contains a valid meme URL
      if (!data || !data.url) {
         throw new Error('Invalid response from meme API');
      }

      setMeme({
        id: data.postLink, // Use postLink or another unique identifier if available
        title: data.title,
        url: data.url,
        source: `r/${data.subreddit}`,
      });
    } catch (err) {
      console.error('Error fetching meme:', err);
      setError('Failed to load meme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    setDisliked(false);
    // In a real app, you might send this interaction data to a backend
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    // In a real app, you might send this interaction data to a backend
  };

  return (
    <Widget
      title="Dev Humor"
      icon={<FiSmile />}
      onRefresh={fetchData} // Use fetchData directly for refresh
      isLoading={isLoading}
      className={className}
    >
      {error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">
          {error}
          <button
            onClick={fetchData}
            className="ml-2 px-3 py-1 bg-primary text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary dark:border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : meme ? (
        <div className="space-y-4">
          <h4 className="text-center font-medium">{meme.title}</h4>
          <div className="flex justify-center bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
            <img
              src={meme.url}
              alt={meme.title}
              className="max-w-full max-h-80 object-contain"
              onError={(e) => {
                 // Handle image loading errors, maybe show a placeholder
                 console.error('Error loading meme image:', meme.url);
                 setError('Failed to load meme image.');
                 e.target.style.display = 'none'; // Hide broken image icon
              }}
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Source: {meme.source}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 hover:text-green-500 ${liked ? 'text-green-500' : ''}`}
              >
                <FiThumbsUp />
                <span>Like</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1 hover:text-red-500 ${disliked ? 'text-red-500' : ''}`}
              >
                <FiThumbsDown />
                <span>Dislike</span>
              </button>
            </div>
          </div>
          <button
             onClick={fetchData}
             className="w-full mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors text-center"
           >
             Show another
           </button>
        </div>
      ) : (
         <div className="text-center py-4 text-gray-500 dark:text-gray-400">No meme loaded.</div>
      )}
    </Widget>
  );
} 