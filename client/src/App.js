import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Gallery from './pages/Gallery';
import Teams from './pages/Teams';
import VolunteerRegister from './pages/VolunteerRegister';
import VolunteerLogin from './pages/VolunteerLogin';
import JoinNSS from './pages/JoinNSS';
import AdminLogin from './pages/AdminLogin';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import VolunteerProfile from './pages/volunteer/Profile';
import VolunteerAttendanceHistory from './pages/volunteer/AttendanceHistory';
import VolunteerUploadActivity from './pages/volunteer/UploadActivity';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVolunteers from './pages/admin/Volunteers';
import VolunteerApproval from './pages/admin/VolunteerApproval';
import VolunteerManagement from './pages/admin/VolunteerManagement';
import AdminEvents from './pages/admin/Events';
import AdminGallery from './pages/admin/Gallery';
import AdminTeams from './pages/admin/Teams';
import AdminAnnouncements from './pages/admin/Announcements';
import Announcements from './pages/Announcements';
import Cells from './pages/Cells';

import AdminAttendance from './pages/admin/Attendance';
import AttendanceAnalytics from './pages/admin/AttendanceAnalytics';
import ChangePassword from './pages/admin/ChangePassword';
import AdminProfile from './pages/admin/Profile';
import AdminFeedback from './pages/admin/Feedback';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/cells" element={<Cells />} />
                <Route path="/volunteer/register" element={<VolunteerRegister />} />
                <Route path="/volunteer/login" element={<VolunteerLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Join NSS Route - Redirects to login if not authenticated */}
                <Route 
                  path="/volunteer/join-nss" 
                  element={<JoinNSS />} 
                />
                
                {/* Protected Volunteer Routes */}
                <Route 
                  path="/volunteer/dashboard" 
                  element={
                    <ProtectedRoute role="volunteer">
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/volunteer/profile" 
                  element={
                    <ProtectedRoute role="volunteer">
                      <VolunteerProfile />
                    </ProtectedRoute>
                  } 
                />
                                <Route 
                  path="/volunteer/attendance"
                  element={
                    <ProtectedRoute role="volunteer">
                      <VolunteerAttendanceHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/volunteer/upload"
                  element={
                    <ProtectedRoute role="volunteer">
                      <VolunteerUploadActivity />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/announcements"
                  element={<Announcements />} 
                />
                
                {/* Protected Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/volunteers" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminVolunteers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/volunteer-approval" 
                  element={
                    <ProtectedRoute role="admin">
                      <VolunteerApproval />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/volunteer-management" 
                  element={
                    <ProtectedRoute role="admin">
                      <VolunteerManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/events" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminEvents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/gallery" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminGallery />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/teams" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminTeams />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/announcements" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminAnnouncements />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/admin/attendance" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminAttendance />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/admin/attendance-analytics" 
                  element={
                    <ProtectedRoute role="admin">
                      <AttendanceAnalytics />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/admin/change-password" 
                  element={
                    <ProtectedRoute role="admin">
                      <ChangePassword />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/admin/profile" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/feedback" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminFeedback />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
