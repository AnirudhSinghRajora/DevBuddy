import { useState, useEffect } from 'react';
import { FiCloud, FiMapPin, FiThermometer, FiWind, FiDroplet, FiSearch, FiSettings } from 'react-icons/fi';
import Widget from './Widget';
import { weatherService } from '../../services/api';

export default function WeatherWidget({ className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('San Francisco');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem('OPENWEATHER_API_KEY');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      fetchData();
    } else {
      setIsLoading(false);
      setError('OpenWeather API key required. Please add your API key in settings.');
      setShowSettings(true);
    }
  }, []);

  const fetchData = async (city = 'San Francisco') => {
    if (!city) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getWeatherByCity(city);
      setWeatherData(data);
      setLocation(city);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message || 'Failed to load weather data. Please check the city name and try again.');
      setIsLoading(false);
      
      // If API key is missing, show settings
      if (err.message === 'OpenWeather API key not found. Please add your API key.') {
        setShowSettings(true);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchData(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('OPENWEATHER_API_KEY', apiKey.trim());
      setShowSettings(false);
      fetchData(location);
    }
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️';
    
    // In a real app, you would use more detailed weather icons
    switch (condition) {
      case 'Clear':
        return '☀️';
      case 'Clouds':
        return '☁️';
      case 'Rain':
        return '🌧️';
      case 'Thunderstorm':
        return '⛈️';
      case 'Drizzle':
        return '🌦️';
      case 'Snow':
        return '❄️';
      case 'Mist':
      case 'Fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  const getWeatherSuggestion = (condition, temp) => {
    if (!condition) return "Good conditions for coding today!";
    
    if (condition === 'Clear' && temp > 20) {
      return "Perfect weather for outdoor coding! Maybe a rooftop café?";
    } else if (condition === 'Clear' && temp <= 20) {
      return "Nice day, but a bit cool. Maybe code by a sunny window?";
    } else if (condition === 'Clouds') {
      return "Overcast day - ideal for focused coding sessions indoors.";
    } else if (['Rain', 'Thunderstorm', 'Drizzle'].includes(condition)) {
      return "Rainy day! Perfect time to code indoors with a hot beverage.";
    } else if (condition === 'Snow') {
      return "It's snowing! Stay warm and cozy while coding indoors.";
    }
    return "Good conditions for coding today!";
  };

  return (
    <Widget 
      title="Weather" 
      icon={<FiCloud />}
      onRefresh={() => fetchData(location)}
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
          <h4 className="font-medium">Weather Settings</h4>
          <form onSubmit={handleSaveApiKey} className="space-y-3">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                OpenWeather API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenWeather API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Get your API key from <a href="https://openweathermap.org/api" className="text-primary dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
              >
                Save API Key
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="mb-4 flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
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
          ) : weatherData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FiMapPin className="text-gray-500 dark:text-gray-400" />
                  <span>{weatherData.name}</span>
                </div>
                <span className="text-4xl">{getWeatherIcon(weatherData.weather[0]?.main)}</span>
              </div>
              
              <div className="flex justify-center items-center">
                <div className="text-center">
                  <div className="text-5xl font-light">{Math.round(weatherData.main?.temp)}°C</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{weatherData.weather[0]?.description}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <FiThermometer className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium">{Math.round(weatherData.main?.feels_like)}°C</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Feels like</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <FiWind className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium">{weatherData.wind?.speed} m/s</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                    <FiDroplet className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium">{weatherData.main?.humidity}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
                </div>
              </div>

              {/* Additional Weather Details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Min/Max</span>
                    <span className="text-sm font-medium">
                      {Math.round(weatherData.main?.temp_min)}° / {Math.round(weatherData.main?.temp_max)}°
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pressure</span>
                    <span className="text-sm font-medium">{weatherData.main?.pressure} hPa</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Visibility</span>
                    <span className="text-sm font-medium">{(weatherData.visibility / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Clouds</span>
                    <span className="text-sm font-medium">{weatherData.clouds?.all}%</span>
                  </div>
                </div>
              </div>

              {/* Sunrise/Sunset Times */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sunrise</div>
                    <div className="text-sm font-medium">
                      {new Date(weatherData.sys?.sunrise * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sunset</div>
                    <div className="text-sm font-medium">
                      {new Date(weatherData.sys?.sunset * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <strong>Coding Suggestion:</strong> {getWeatherSuggestion(weatherData.weather[0]?.main, weatherData.main?.temp)}
              </div>
            </div>
          )}
        </>
      )}
    </Widget>
  );
} 