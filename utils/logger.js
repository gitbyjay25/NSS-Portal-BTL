// BACKEND LOGGING SYSTEM
// This file handles all logging for the backend
// Easy to modify and maintain

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    this.logs = [];
    this.maxLogs = 1000;
  }

  // Create logs directory if it doesn't exist
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Get timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Get log file path for today
  getLogFilePath() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app_${today}.log`);
  }

  // Write log to file
  writeToFile(level, message, data = null) {
    try {
      const logEntry = {
        timestamp: this.getTimestamp(),
        level,
        message,
        data: data ? JSON.stringify(data, null, 2) : null,
        pid: process.pid
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.getLogFilePath(), logLine);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  // Add to memory
  addToMemory(level, message, data = null) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
      pid: process.pid
    };

    this.logs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Log levels
  info(message, data = null) {
    this.addToMemory('INFO', message, data);
    this.writeToFile('INFO', message, data);
  }

  warn(message, data = null) {
    this.addToMemory('WARN', message, data);
    this.writeToFile('WARN', message, data);
  }

  error(message, error = null) {
    this.addToMemory('ERROR', message, error);
    this.writeToFile('ERROR', message, error);
  }

  success(message, data = null) {
    this.addToMemory('SUCCESS', message, data);
    this.writeToFile('SUCCESS', message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.addToMemory('DEBUG', message, data);
      this.writeToFile('DEBUG', message, data);
    }
  }

  // API request logging
  apiRequest(method, url, statusCode, responseTime, data = null) {
    const message = `${method} ${url} - ${statusCode} (${responseTime}ms)`;
    this.info(`API Request: ${message}`, data);
  }

  // Database operation logging
  dbOperation(operation, collection, data = null) {
    const message = `DB ${operation} on ${collection}`;
    this.debug(message, data);
  }

  // Authentication logging
  authEvent(event, userId, data = null) {
    const message = `Auth ${event} for user ${userId}`;
    this.info(message, data);
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
  }

  // Get log file content
  getLogFileContent(date = null) {
    try {
      const logDate = date || new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `app_${logDate}.log`);
      
      if (fs.existsSync(logFile)) {
        return fs.readFileSync(logFile, 'utf8');
      }
      return null;
    } catch (error) {
      this.error('Failed to read log file', error);
      return null;
    }
  }

  // Clean old log files (older than 30 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach(file => {
        if (file.startsWith('app_') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            this.info(`Cleaned old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Failed to clean old log files', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

module.exports = logger;
