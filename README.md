# NSS Portal - National Service Scheme Web Portal

A comprehensive web portal for managing National Service Scheme (NSS) activities, volunteers, and events. Built with Node.js, React, and MongoDB.

## 🚀 Features

### Public Features
- **Home Page**: Hero section, features, statistics, and call-to-action
- **About Us**: NSS information, mission, vision, team, and achievements
- **Events**: Browse upcoming and past events with filtering
- **Gallery**: View approved images from community service activities
- **Volunteer Registration**: Join NSS as a volunteer

### Volunteer Features (Login Required)
- **Dashboard**: Overview of activities and upcoming events
- **Event Management**: Register/unregister for events, view participation history
- **Profile Management**: Update personal information and profile picture
- **Gallery Upload**: Share images from completed activities (pending admin approval)
- **Achievements**: Track participation and earned certificates

### Admin Features (Login Required)
- **Dashboard**: Statistics and overview of NSS activities
- **Volunteer Management**: Approve registrations, manage volunteer accounts
- **Event Management**: Create, edit, and manage events
- **Gallery Management**: Approve/reject volunteer uploads, add official images
- **Announcements**: Broadcast messages to volunteers
- **Reports**: Generate participation and activity reports

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **multer** - File uploads
- **nodemailer** - Email functionality

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Toastify** - Notifications

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd nss-portal
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nss-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start MongoDB manually
mongod
```

## 🏃‍♂️ Running the Application

### Development Mode (Both Backend and Frontend)
```bash
npm run dev:full
```

### Backend Only
```bash
npm run dev
```

### Frontend Only
```bash
npm run client
```

### Production Build
```bash
npm run build
npm start
```

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://localhost:27017/nss-portal

## 🗄️ Database Setup

The application will automatically create the necessary collections when it starts. However, you may want to create an admin user manually:

```javascript
// In MongoDB shell or MongoDB Compass
use nss-portal
db.users.insertOne({
  name: "Admin User",
  email: "abc.com",
  password: "6$28#0...", // Hashed password
  role: "admin",
  isApproved: true,
  isActive: true,
  college: "Your College",
  department: "Computer Science",
  year: 4,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔐 Default Admin Account

You can create an admin account through the registration process and then manually update the role in the database, or use the MongoDB command above.

## 📁 Project Structure

```
nss-portal/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── models/                 # MongoDB schemas
├── routes/                 # API routes
├── middleware/             # Custom middleware
├── server.js              # Main server file
└── package.json
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Volunteer registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `POST /api/events/:id/register` - Register for event (Volunteer only)
- `POST /api/events/:id/unregister` - Unregister from event (Volunteer only)

### Volunteers
- `GET /api/volunteers/profile` - Get volunteer profile
- `PUT /api/volunteers/profile` - Update profile
- `GET /api/volunteers/events/upcoming` - Get upcoming events
- `GET /api/volunteers/events/past` - Get past events
- `GET /api/volunteers/stats` - Get volunteer statistics

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/volunteers` - Get all volunteers
- `PUT /api/admin/volunteers/:id/approve` - Approve volunteer
- `GET /api/admin/gallery/pending` - Get pending gallery approvals
- `PUT /api/admin/gallery/:id/approve` - Approve gallery item

### Gallery
- `GET /api/gallery` - Get approved gallery images
- `POST /api/gallery` - Upload image (Volunteer only)
- `PUT /api/gallery/:id/like` - Like/unlike image

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin only)
- `PUT /api/announcements/:id` - Update announcement (Admin only)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Security headers with helmet
- Input validation
- CORS configuration
- Protected routes

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests (if implemented)
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the build folder with a web server
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest features and bug fixes by regularly pulling from the main branch.

---

**Note**: This is a development version. For production use, ensure proper security measures, environment configuration, and testing are in place.
