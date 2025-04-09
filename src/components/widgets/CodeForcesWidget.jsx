import { useState, useEffect } from 'react';
import { FiCode, FiTrendingUp, FiCalendar, FiCheckSquare, FiSearch } from 'react-icons/fi';
import Widget from './Widget';
import { codeforceService } from '../../services/api';

export default function CodeForcesWidget({ className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [contests, setContests] = useState([]);
  const [error, setError] = useState(null);
  const [handle, setHandle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (userHandle = 'tourist') => {
    if (!userHandle) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user data
      const user = await codeforceService.getUserProfile(userHandle);
      setUserData(user);
      setHandle(userHandle);
      
      // Fetch contests data
      const contestsList = await codeforceService.getContests();
      setContests(contestsList);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching Codeforces data:', err);
      setError('Failed to load Codeforces data. Please check the handle and try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchData(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // Format rating color based on Codeforces rating system
  const getRatingColor = (rating) => {
    if (!rating) return 'text-gray-500 dark:text-gray-400';
    if (rating < 1200) return 'text-gray-500 dark:text-gray-400';
    if (rating < 1400) return 'text-green-500';
    if (rating < 1600) return 'text-cyan-500';
    if (rating < 1900) return 'text-blue-500';
    if (rating < 2100) return 'text-purple-500';
    if (rating < 2400) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Widget 
      title="Competitive Programming" 
      icon={<FiCode />}
      onRefresh={() => fetchData(handle)}
      isLoading={isLoading}
      className={className}
    >
      <form onSubmit={handleSearch} className="mb-4 flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Codeforces handle..."
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-r-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
          disabled={isLoading}
        >
          <FiSearch />
        </button>
      </form>

      {error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">{error}</div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary dark:border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {userData && (
            <div className="space-y-3">
              <div className="flex  justify-between items-center">
                <h4 className="font-medium text-lg">Profile: {userData.handle}</h4>
                <span className={`font-medium ${getRatingColor(userData.rating)}`}>
                  {userData.rating ? `${userData.rating} (${userData.rank || 'unrated'})` : 'Unrated'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <FiTrendingUp className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm">Max: {userData.maxRating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <FiCheckSquare className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm">Contribution: {userData.contribution || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Upcoming Contests</h4>
            {contests.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming contests found</p>
            ) : (
              <ul className="space-y-2">
                {contests.slice(0, 3).map(contest => (
                  <li key={contest.id} className="text-sm border-l-2 border-primary dark:border-blue-600 pl-2 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p>{contest.name}</p>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <FiCalendar className="w-3 h-3" />
                      <span>{formatDate(contest.startTimeSeconds)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Performance Section */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Recent Performance</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Solved</div>
                <div className="font-medium mt-1">{userData?.rating ? Math.floor(userData.rating / 100) : 0}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Contests</div>
                <div className="font-medium mt-1">{userData?.maxRating ? Math.floor(userData.maxRating / 500) : 0}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Global Rank</div>
                <div className="font-medium mt-1">#{userData?.rating ? Math.floor(3000000 / userData.rating) : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Widget>
  );
} 