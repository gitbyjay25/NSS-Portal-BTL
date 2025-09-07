const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://10.193.17.97:3000',
    'http://192.168.1.100:3000',
    'http://192.168.0.100:3000',
    'http://10.0.0.100:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for development)
});

// Specific rate limit for auth routes (more lenient)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 auth requests per windowMs
});

app.use(limiter);
app.use('/api/auth', authLimiter); // Apply auth rate limit specifically

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nss-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
.then(() => {
  logger.success('MongoDB connected successfully');
  
  // Load routes after MongoDB connects
  console.log('🔧 Loading API routes...');
  
  try {
    console.log('  📍 Loading /api/auth route...');
    app.use('/api/auth', require('./routes/auth'));
    console.log('  ✅ /api/auth route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/auth route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/volunteers route...');
    app.use('/api/volunteers', require('./routes/volunteers'));
    console.log('  ✅ /api/volunteers route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/volunteers route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/events route...');
    app.use('/api/events', require('./routes/events'));
    console.log('  ✅ /api/events route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/events route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/gallery route...');
    app.use('/api/gallery', require('./routes/gallery'));
    console.log('  ✅ /api/gallery route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/gallery route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/feedback route...');
    app.use('/api/feedback', require('./routes/feedback'));
    console.log('  ✅ /api/feedback route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/feedback route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/admin route...');
    app.use('/api/admin', require('./routes/admin'));
    console.log('  ✅ /api/admin route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/admin route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/announcements route...');
    app.use('/api/announcements', require('./routes/announcements'));
    console.log('  ✅ /api/announcements route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/announcements route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/teams route...');
    app.use('/api/teams', require('./routes/teams'));
    console.log('  ✅ /api/teams route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/teams route:', error.message);
  }

  try {
    console.log('  📍 Loading /api/attendance route...');
    app.use('/api/attendance', require('./routes/attendance'));
    console.log('  ✅ /api/attendance route loaded successfully');
  } catch (error) {
    console.error('  ❌ Error loading /api/attendance route:', error.message);
  }

  // Add a test route for /api
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'NSS Portal API is working!',
      availableRoutes: [
        '/api/auth',
        '/api/volunteers', 
        '/api/events',
        '/api/gallery',
        '/api/admin',
        '/api/announcements',
        '/api/teams',
        '/api/attendance'
      ]
    });
  });

  // Error handling middleware (must be after routes)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });

  // 404 handler (must be last)
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  console.log('🔧 All routes loaded. Starting server...');
  
  // Start server after routes are loaded
  const PORT = process.env.PORT || 5002;
  const HOST = '0.0.0.0'; // Listen on all network interfaces
  app.listen(PORT, HOST, () => {
    console.log(`🚀 NSS Portal Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 Backend API: http://localhost:${PORT}/api`);
    console.log(`🌐 Network Access: http://10.235.152.97:${PORT}/api`);
  });
})
.catch(err => {
  logger.error('MongoDB connection failed', err);
  logger.warn('Server will continue with limited functionality (mock data)');
});
