// 📊 LOG VIEWER COMPONENT
// This component allows admins to view and export application logs
// Easy to use and understand

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Filter, Search, RefreshCw, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import logger from '../../utils/logger';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load logs on component mount
  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs based on search term and level
  useEffect(() => {
    let filtered = logs;

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.level.toLowerCase().includes(searchLower) ||
        (log.data && log.data.toLowerCase().includes(searchLower))
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter]);

  // Load logs from logger
  const loadLogs = () => {
    try {
      setIsLoading(true);
      const allLogs = logger.getLogs();
      setLogs(allLogs);
      logger.info('Logs loaded in LogViewer', { count: allLogs.length });
    } catch (error) {
      logger.error('Failed to load logs in LogViewer', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all logs
  const clearLogs = () => {
    try {
      logger.clearLogs();
      setLogs([]);
      setFilteredLogs([]);
      logger.info('All logs cleared by admin');
    } catch (error) {
      logger.error('Failed to clear logs', error);
    }
  };

  // Export logs
  const exportLogs = () => {
    try {
      logger.exportLogs();
      logger.info('Logs exported by admin');
    } catch (error) {
      logger.error('Failed to export logs', error);
    }
  };

  // Get log level icon
  const getLogIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <Info className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get log level color
  const getLogColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      case 'WARN':
        return 'bg-yellow-50 border-yellow-200';
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      case 'DEBUG':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600 mr-3" />
                Log Viewer
              </h1>
              <p className="text-gray-600 mt-1">View and manage application logs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadLogs}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportLogs}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={clearLogs}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Logs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by message, level, or data..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Level
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warning</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="DEBUG">Debug</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(log => log.level === 'ERROR').length}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter(log => log.level === 'WARN').length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.level === 'SUCCESS').length}
            </div>
            <div className="text-sm text-gray-600">Success</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(log => log.level === 'INFO').length}
            </div>
            <div className="text-sm text-gray-600">Info</div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Application Logs ({filteredLogs.length})
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="w-6 h-6 text-gray-400 mr-2" />
                <span className="text-gray-600">No logs found</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log, index) => (
                  <div key={index} className={`p-4 ${getLogColor(log.level)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getLogIcon(log.level)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {log.level}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {log.message}
                          </p>
                          {log.data && (
                            <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                              {log.data}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
