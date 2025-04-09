import { useState, useEffect } from 'react';
import { FiGithub, FiStar, FiGitBranch, FiUsers, FiSearch } from 'react-icons/fi';
import Widget from './Widget';
import { githubService } from '../../services/api';

export default function GitHubWidget({ className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (user = 'github') => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userProfile = await githubService.getUserProfile(user);
      setUserData(userProfile);
      
      const userRepos = await githubService.getUserRepos(user);
      setRepos(userRepos);
      
      setUsername(user);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching GitHub data:', err);
      setError('Failed to load GitHub data. Please check the username and try again.');
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

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'bg-yellow-300',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-orange-500',
      'C++': 'bg-pink-500',
      HTML: 'bg-red-500',
      CSS: 'bg-purple-500',
    };
    
    return colors[language] || 'bg-gray-500';
  };

  return (
    <Widget 
      title="GitHub Activity" 
      icon={<FiGithub />}
      onRefresh={() => fetchData(username)}
      isLoading={isLoading}
      className={className}
    >
      <form onSubmit={handleSearch} className="mb-4 flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search GitHub username..."
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
            <div className="flex items-center gap-4">
              <img 
                src={userData.avatar_url} 
                alt={userData.login} 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-medium">{userData.name || userData.login}</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">@{userData.login}</div>
              </div>
            </div>
          )}
          
          {userData && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                  <FiUsers className="w-3 h-3" />
                  <span className="text-xs">Followers</span>
                </div>
                <div className="font-medium">{userData.followers}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                  <FiUsers className="w-3 h-3" />
                  <span className="text-xs">Following</span>
                </div>
                <div className="font-medium">{userData.following}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                  <FiGitBranch className="w-3 h-3" />
                  <span className="text-xs">Repos</span>
                </div>
                <div className="font-medium">{userData.public_repos}</div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Top Repositories</h4>
            {repos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No repositories found.</p>
            ) : (
              <div className="space-y-3">
                {repos.slice(0, 3).map(repo => (
                  <div key={repo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-primary dark:text-blue-400">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {repo.name}
                          </a>
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{repo.description || 'No description provided.'}</p>
                      </div>
                      {repo.language && (
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)} mr-1`}></span>
                          <span className="text-xs">{repo.language}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-3 h-3" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiGitBranch className="w-3 h-3" />
                        <span>{repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Widget>
  );
} 