import { useState } from 'react';
import { FiRefreshCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function Widget({ 
  title, 
  icon, 
  children, 
  onRefresh, 
  className = '',
  isLoading = false,
  extraActions = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRefresh = () => {
    if (onRefresh && !isLoading) {
      onRefresh();
    }
  };

  return (
    <div className={`
      rounded-lg border border-gray-200 dark:border-gray-700 
      bg-white dark:bg-gray-800 shadow
      ${isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''}
      ${className}
    `}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {icon && <span className="text-blue-500 dark:text-blue-400">{icon}</span>}
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {extraActions}
          {onRefresh && (
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              aria-label="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button 
            onClick={toggleExpand}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
} 