import { useState, useEffect } from 'react';
import { FiCloud, FiMapPin, FiThermometer, FiWind, FiDroplet, FiSearch } from 'react-icons/fi';
import Widget from './Widget';
import { weatherService } from '../../services/api';

export default function WeatherWidget({ className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('San Francisco');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
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
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchData(searchQuery.trim());
      setSearchQuery('');
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
    >
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
                <FiThermometer className="mr-1" />
                <span className="text-xs">Feels</span>
              </div>
              <div className="text-sm">{Math.round(weatherData.main?.feels_like)}°C</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                <FiWind className="mr-1" />
                <span className="text-xs">Wind</span>
              </div>
              <div className="text-sm">{Math.round(weatherData.wind?.speed)} m/s</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                <FiDroplet className="mr-1" />
                <span className="text-xs">Humid</span>
              </div>
              <div className="text-sm">{weatherData.main?.humidity}%</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300 text-center mt-4">
            {getWeatherSuggestion(weatherData.weather[0]?.main, weatherData.main?.temp)}
          </div>
        </div>
      )}
    </Widget>
  );
} 