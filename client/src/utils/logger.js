//  CENTRALIZED LOGGING SYSTEM
// This file handles all logging for the frontend
// Easy to modify and maintain

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  // Add timestamp to log
  getTimestamp() {
    return new Date().toISOString();
  }

  // Add log to memory storage
  addToMemory(level, message, data = null) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Could not save logs to localStorage:', error);
    }
  }

  // Log levels
  info(message, data = null) {
    this.addToMemory('INFO', message, data);
  }

  warn(message, data = null) {
    this.addToMemory('WARN', message, data);
  }

  error(message, error = null) {
    this.addToMemory('ERROR', message, error);
  }

  success(message, data = null) {
    this.addToMemory('SUCCESS', message, data);
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      this.addToMemory('DEBUG', message, data);
    }
  }

  // Get all logs
  getLogs() {
    return this.logs;
  }

  // Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  // Export logs as JSON
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Load logs from localStorage
  loadLogs() {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.warn('Could not load logs from localStorage:', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Load existing logs on initialization
logger.loadLogs();

export default logger;
