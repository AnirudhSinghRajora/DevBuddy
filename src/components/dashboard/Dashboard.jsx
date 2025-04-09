import { useState } from 'react';
import { FiCode, FiGithub, FiCloud, FiMusic, FiSmile } from 'react-icons/fi';
import CodeForcesWidget from '../widgets/CodeForcesWidget';
import GitHubWidget from '../widgets/GitHubWidget';
import WeatherWidget from '../widgets/WeatherWidget';
import MusicWidget from '../widgets/MusicWidget';
import MemeWidget from '../widgets/MemeWidget';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'competitive', label: 'Competitive Coding', icon: <FiCode /> },
    { id: 'github', label: 'GitHub', icon: <FiGithub /> },
    { id: 'weather', label: 'Weather', icon: <FiCloud /> },
    { id: 'music', label: 'Music', icon: <FiMusic /> },
    { id: 'memes', label: 'Memes', icon: <FiSmile /> },
  ];

  // Helper to render the correct widget based on tab ID
  const renderWidget = (tabId) => {
    switch (tabId) {
      case 'competitive': return <CodeForcesWidget />;
      case 'github': return <GitHubWidget />;
      case 'weather': return <WeatherWidget />;
      case 'music': return <MusicWidget />;
      case 'memes': return <MemeWidget />;
      default: return null;
    }
  };

  return (
    <div className="py-6 md:py-8"> {/* Increased vertical padding */}
      {/* Tab Navigation */}
      <nav className="mb-8 pb-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"> {/* Increased margin-bottom */}
        <div className="flex space-x-3"> {/* Increased spacing between tabs */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-primary dark:bg-blue-600 text-white shadow-sm' // Enhanced active style
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Widgets Area */}
      {activeTab === 'all' ? (
        // Grid layout for the 'All' tab - Using 2 columns as base for md+
        <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-8 [&>*]:h-full">
          {/* Row 1: CodeForces and GitHub - ensure equal heights */}
          <div className="col-span-1 flex">
            <div className="w-full">
              <CodeForcesWidget />
            </div>
          </div>
          <div className="col-span-1 flex">
            <div className="w-full">
              <GitHubWidget />
            </div>
          </div>
          {/* Row 2: Weather and Memes - ensure equal heights */}
          <div className="col-span-1 flex">
            <div className="w-full">
              <WeatherWidget />
            </div>
          </div>
          <div className="col-span-1 flex">
            <div className="w-full">
              <MemeWidget />
            </div>
          </div>
          {/* Music spans full width */}
          <div className="col-span-1 md:col-span-2 flex">
            <div className="w-full">
              <MusicWidget />
            </div>
          </div>
        </div>
      ) : (
        // Render single widget when a specific tab is selected
        <div> {/* Simple div container for single widget */}
           {renderWidget(activeTab)}
        </div>
      )}
    </div>
  );
} 