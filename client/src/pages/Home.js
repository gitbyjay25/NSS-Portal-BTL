import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import logger from '../utils/logger';
import errorHandler from '../utils/errorHandler';
import { ArrowUp, Users } from 'lucide-react';

// Feedback Card Component
const FeedbackCard = ({ feedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text is long enough to need truncation (more than 150 characters)
  const isLongText = feedback.testimonial && feedback.testimonial.length > 150;
  
  // Get the text to display
  const displayText = isExpanded || !isLongText 
    ? feedback.testimonial 
    : feedback.testimonial.substring(0, 150) + '...';

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="group relative bg-gradient-to-br from-white via-purple-50/30 to-violet-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-200/50 backdrop-blur-sm">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full -translate-x-8 -translate-y-8"></div>
      </div>
      
      {/* Feedback Card Content */}
      <div className="relative p-6">
        <div className="flex items-start space-x-4">
          {/* Profile Picture with Enhanced Design */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-purple-200/50">
                <img 
                  src={feedback.submittedBy?.profilePicture || '/default-avatar.svg'} 
                  alt={feedback.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{feedback.name}</h4>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md">
                {feedback.role}
              </span>
            </div>
            <p className="text-base text-gray-600 mb-4 font-medium">{feedback.department || 'NSS Volunteer'}</p>
            
            {/* Testimonial Text */}
            <div className="relative z-10">
              <blockquote className="text-gray-650 leading-relaxed italic text-base mb-3">
                "{displayText}"
              </blockquote>
              
              {/* Read More/Less Button */}
              {isLongText && (
                <button
                  onClick={handleToggle}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm transition-all duration-200 hover:underline bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full border border-purple-200 cursor-pointer hover:shadow-md active:scale-95 z-20 relative"
                  type="button"
                  aria-label={isExpanded ? "Read less" : "Read more"}
                >
                  {isExpanded ? (
                    <>
                      <span>Read Less</span>
                      <svg className="ml-1 w-4 h-4 transform rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Read More</span>
                      <svg className="ml-1 w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
           </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Bottom accent with gradient */}
      <div className="h-2 bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

const Home = () => {
  // Background images for slideshow
  const backgroundImages = [
    '/jn.jpg', 
    '/grp.jpg',
    '/abc.jpg',
    
    
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedFeedback, setApprovedFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    role: '',
    department: '',
    testimonial: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Check if user is already an approved volunteer
  const isApprovedVolunteer = user && user.nssApplicationStatus === 'approved';

  // Handle Join NSS button click
  const handleJoinNSSClick = (e) => {
    if (isApprovedVolunteer) {
      e.preventDefault();
      toast.info('You are already a Proud Volunteer of NSS GEHU Bhimtal Unit.', {
        autoClose: 5000,
        position: 'top-center'
      });
    }
    // If not approved volunteer, let the Link work normally
  };

  // Change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit feedback');
      return;
    }

    if (!feedbackForm.name.trim() || !feedbackForm.role.trim() || !feedbackForm.testimonial.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (feedbackForm.testimonial.trim().length < 10) {
      toast.error('Testimonial must be at least 10 characters long');
      return;
    }

    try {
      setSubmittingFeedback(true);
      const response = await axios.post('/api/feedback', feedbackForm);
      
      if (response.data.success) {
        toast.success('Feedback submitted successfully! It will be reviewed by admin before publishing.');
        setFeedbackForm({
          name: '',
          role: '',
          department: '',
          testimonial: ''
        });
      }
    } catch (error) {
      errorHandler.handleError(error, 'Feedback submission');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Carousel navigation functions
  const nextFeedback = () => {
    setCurrentFeedbackIndex((prev) => 
      prev + 3 >= approvedFeedback.length ? 0 : prev + 3
    );
  };

  const prevFeedback = () => {
    setCurrentFeedbackIndex((prev) => 
      prev - 3 < 0 ? Math.max(0, approvedFeedback.length - 3) : prev - 3
    );
  };

  // Reset carousel when feedback changes
  useEffect(() => {
    setCurrentFeedbackIndex(0);
  }, [approvedFeedback]);

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && approvedFeedback.length > 3) {
      nextFeedback();
    }
    if (isRightSwipe && approvedFeedback.length > 3) {
      prevFeedback();
    }
  };

  // Fetch approved feedback
  useEffect(() => {
    const fetchApprovedFeedback = async () => {
      try {
        setFeedbackLoading(true);
        const response = await axios.get('/api/feedback');
        if (response.data.success) {
          setApprovedFeedback(response.data.feedback || []);
        }
      } catch (error) {
        errorHandler.handleError(error, 'Approved feedback fetch');
        setApprovedFeedback([]);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchApprovedFeedback();
  }, []);

  // Fetch announcements for home page
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const response = await fetch('/api/announcements?limit=3');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAnnouncements(data.announcements || []);
          }
        }
      } catch (error) {
        errorHandler.handleError(error, 'Announcements fetch');
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch upcoming events for home page
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Take only the first 2 upcoming events for featured display
            const upcoming = data.upcoming || [];
            setFeaturedEvents(upcoming.slice(0, 2));
          }
        }
      } catch (error) {
        errorHandler.handleError(error, 'Upcoming events fetch');
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const stats = [
    { number: "300+", label: "Active Volunteers", image: "/act.png" },
    { number: "20+", label: "Events This Year", image: "/cholliyar.jpg" },
    { number: "1200+", label: "Service Hours", image: "/hr.jpeg" }
  ];

  const galleryHighlights = [
    { id: 1, image: "/grp.jpg", caption: "Community Service" },
    { id: 2, image: "/ag.heic", caption: "Team Building" },
    { id: 3, image: "/grp.jpg", caption: "Environmental Care" },
    { id: 4, image: "/IMG-20250410-WA0016.jpg", caption: "Health Awareness" }
  ];





  return (
    <div className="min-h-screen">


      {/* Hero Section - Background Image Slideshow */}
      <section className="relative h-screen min-h-[500px] max-h-[800px] sm:max-h-[900px] md:max-h-screen overflow-hidden">
        {/* Background Images Slideshow */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: '100%',
              height: '100%',
              left: '0%',
              top: '0%'
            }}
          >
            <img
              src={image}
              alt="NSS Group Photo"
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center center',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
        
        {/* Very Light Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Text Content - Better positioned for mobile */}
        <div className="relative h-full flex items-end justify-center pb-6 sm:pb-12 md:pb-16 lg:pb-24 xl:pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-white">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-serif font-bold mb-2 sm:mb-3 md:mb-4 leading-tight text-white tracking-wide">
                NSS GEHU Bhimtal
              </h1>
              <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-white mx-auto mb-2 sm:mb-3 md:mb-4"></div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-serif text-white/90 leading-relaxed px-1 sm:px-2">
                Not for me, but for the Nation
              </p>
            </div>
          </div>
        </div>
        
                 {/* Bottom Curved Edge - Smaller and More Subtle */}
         <div className="absolute bottom-0 left-0 right-0">
           <svg className="w-full h-12 text-white/60" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M0,0 L1200,0 L1200,120 C800,60 400,60 0,120 Z" fill="currentColor"/>
           </svg>
         </div>
      </section>

                    {/* Quick Stats Section - Box Style Like ALERT SUMMARY */}
       <section className="relative bg-gray-50 py-8 sm:py-12 md:py-16">
         <div className="max-w-6xl mx-auto px-4 sm:px-6">
           {/* Section Header */}
           <div className="text-center mb-6 sm:mb-8">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
               Our Impact in Numbers
             </h2>
             <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
               Making a difference, one volunteer at a time
             </p>
           </div>
           
           {/* Main Stats Box - Like ALERT SUMMARY */}
           <div className="bg-white rounded-lg shadow-lg">
             {/* Box Title */}
             
             
             {/* Stats Container with Card Layout */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6">
               {stats.map((stat, index) => (
                 <div key={index} className="group relative">
                   <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-100 h-full">
                     {/* Image Header */}
                     <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                       <img 
                         src={stat.image} 
                         alt={stat.label}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onError={(e) => {
                           e.target.src = '/default-card.jpg';
                         }}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                     </div>
                     
                     {/* Decorative Elements */}
                     <div className="relative p-8 pb-6">
                       <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                       <div className="absolute bottom-4 left-4 w-2 h-2 bg-indigo-300 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                     </div>
                     
                     {/* Content */}
                     <div className="px-8 pb-8 text-center">
                       <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                         {stat.number}
                       </h3>
                       <p className="text-gray-600 leading-relaxed text-base">
                         {stat.label}
                       </p>
                     </div>
                     
                     {/* Bottom Decoration */}
                     <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>


                           {/* Featured Events Preview - Beautiful & Engaging */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700">Upcoming</span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join us in our upcoming community service activities and make a positive impact
              </p>
            </div>
            
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {loading ? (
                // Loading skeleton
                <>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-8">
                      <div className="h-8 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-3 mb-6">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-8">
                      <div className="h-8 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-3 mb-6">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </>
              ) : featuredEvents.length > 0 ? (
                featuredEvents.map((event) => (
                  <div key={event._id} className="group relative">
                    {/* Event Card */}
                    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                      {/* Image Container */}
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={event.image || "/default-event.jpg"} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Date Badge */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                          <span className="text-sm font-semibold text-gray-800">{formatDate(event.startDate)}</span>
                        </div>
                        
                        {/* Location Badge */}
                        <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                          <span className="text-sm font-semibold text-white">📍 {event.location}</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                          {event.title}
                        </h3>
                        
                        {/* Event Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-gray-600">
                            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-xs">📅</span>
                            </span>
                            <span className="font-medium">{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 text-xs">📍</span>
                            </span>
                            <span className="font-medium">{event.location}</span>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Link
                          to={`/events/${event._id}`}
                          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Learn More
                          <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // No events message
                <div className="col-span-2 text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-gray-600">Check back soon for new community service activities!</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* View All Button */}
            <div className="text-center mt-8">
              <Link
                to="/events"
                className="inline-flex items-center bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300"
              >
                <span>View All Events</span>
                <span className="ml-2 text-blue-600">→</span>
              </Link>
            </div>
          </div>
        </section>

                           {/* Recent Gallery Highlights - Beautiful & Engaging */}
        <section className="relative bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-green-700">Memories</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Gallery Highlights
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Take a look at our recent activities and community service initiatives
              </p>
            </div>
            
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {galleryHighlights.map((item, index) => (
                <div key={item.id} className="group relative">
                  {/* Gallery Item */}
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                      <div className="p-6 w-full">
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg mb-2">{item.caption}</h3>
                          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            <span className="text-white text-sm font-medium">View Details</span>
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-xs font-semibold text-gray-800">#{index + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View Full Gallery Button */}
            <div className="text-center mt-8">
              <Link
                to="/gallery"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>View Full Gallery</span>
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

                                                                                   {/* Experience - Beautiful & Engaging with New Feedback */}
          <section className="relative bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-purple-700">Stories</span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  What Our Volunteers Say
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Hear from our dedicated volunteers about their life-changing NSS experiences
                </p>
              </div>
              
              {/* Testimonials Container - Beautiful Grid Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Left Side - Approved Feedback Display with Carousel */}
                <div className="relative">
                  {feedbackLoading ? (
                    // Loading skeleton
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 animate-pulse">
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                              <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : approvedFeedback.length > 0 ? (
                    <>
                      {/* Feedback Cards Container */}
                      <div 
                        className="relative overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        <div className="space-y-6 transition-all duration-300 ease-in-out">
                          {approvedFeedback.slice(currentFeedbackIndex, currentFeedbackIndex + 3).map((feedback, index) => (
                            <FeedbackCard key={currentFeedbackIndex + index} feedback={feedback} />
                          ))}
                        </div>
                      </div>

                      {/* Navigation Arrows - Only show if more than 3 feedback items */}
                      {approvedFeedback.length > 3 && (
                        <>
                          {/* Left Arrow */}
                          <button
                            onClick={prevFeedback}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-purple-200 flex items-center justify-center hover:bg-purple-50 transition-all duration-200 z-10"
                          >
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          {/* Right Arrow */}
                          <button
                            onClick={nextFeedback}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-purple-200 flex items-center justify-center hover:bg-purple-50 transition-all duration-200 z-10"
                          >
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}

                      {/* Carousel Indicators */}
                      {approvedFeedback.length > 3 && (
                        <div className="flex justify-center mt-6 space-x-2">
                          {Array.from({ length: Math.ceil(approvedFeedback.length / 3) }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentFeedbackIndex(index * 3)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                Math.floor(currentFeedbackIndex / 3) === index
                                  ? 'bg-purple-600 w-6'
                                  : 'bg-purple-200 hover:bg-purple-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Empty state
                    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💭</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">No Stories Yet</h4>
                      <p className="text-gray-600 mb-4">Be the first to share your NSS experience!</p>
                      <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-full">
                        <span className="text-sm text-purple-700">✨ Your story will appear here once approved</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Feedback Submission Form */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-dashed border-purple-200 p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-800 mb-3">
                      Share Your Story
                    </h3>
                    <p className="text-purple-700 text-base leading-relaxed">
                      New volunteers can share their NSS experiences here. Your feedback will be reviewed and displayed alongside other stories.
                    </p>
                  </div>
                  
                  {/* Feedback Form */}
                  <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Name" 
                      value={feedbackForm.name}
                      onChange={handleFeedbackChange}
                      className="w-full px-5 py-4 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white text-base"
                      required
                    />
                    <input 
                      type="text" 
                      name="role"
                      placeholder="Your Role in NSS" 
                      value={feedbackForm.role}
                      onChange={handleFeedbackChange}
                      className="w-full px-5 py-4 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white text-base"
                      required
                    />
                    <input 
                      type="text" 
                      name="department"
                      placeholder="Your Department (Optional)" 
                      value={feedbackForm.department}
                      onChange={handleFeedbackChange}
                      className="w-full px-5 py-4 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white text-base"
                    />
                    <textarea 
                      name="testimonial"
                      placeholder="Share your NSS experience..." 
                      rows="5"
                      value={feedbackForm.testimonial}
                      onChange={handleFeedbackChange}
                      className="w-full px-5 py-4 rounded-lg border border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none bg-white text-base"
                      required
                    ></textarea>
                    
                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white px-8 py-4 rounded-lg font-semibold text-base hover:from-purple-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                  
                  <p className="text-sm text-purple-600 mt-4 text-center">
                    * Your feedback will be reviewed by admin before publishing
                  </p>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="text-center mt-16">
                <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 border border-purple-200">
                  <span className="text-purple-600 font-semibold">Want to share your story?</span>
                  <Link
                    to="/volunteer/register"
                    onClick={handleJoinNSSClick}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      isApprovedVolunteer 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:from-emerald-600 hover:to-green-700' 
                        : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600'
                    }`}
                  >
                    {isApprovedVolunteer ? 'Already a Volunteer' : 'Join NSS Today'}
                  </Link>
                </div>
              </div>
            </div>
          </section>



             {/* Leadership Section */}
       <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
         <div className="max-w-7xl mx-auto px-6">
           {/* Section Header */}
           <div className="text-center mb-16">
             <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
               <span className="text-sm font-medium text-purple-700">Our Leaders</span>
               <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
             </div>
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
               Meet Our Leadership Team
             </h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
               Discover the dedicated leaders who guide our NSS unit and inspire positive change in our community.
             </p>
             <Link
               to="/leadership"
               className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
             >
               <Users className="h-5 w-5 mr-2" />
               View All Leaders
             </Link>
           </div>
         </div>
       </section>

             {/* Our Core Services Section - Beautiful & Engaging */}
       <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
         <div className="max-w-7xl mx-auto px-6">
           {/* Section Header */}
           <div className="text-center mb-16">
             <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               <span className="text-sm font-medium text-blue-700">Core Services</span>
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
             </div>
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
               Want To Make A Difference !!
             </h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
             Join us in making a difference in our community through various social service activities and initiatives.
             </p>
           </div>
           
           {/* Services Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="group relative">
               {/* Environmental Care Card */}
               <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-100">
                 {/* Image Header */}
                 <div className="relative h-48 overflow-hidden">
                   <img 
                     src="/plant.jpeg" 
                     alt="Environmental Care"
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onError={(e) => {
                       e.target.src = '/default-card.jpg';
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 </div>
                 
                 {/* Decorative Elements */}
                 <div className="relative p-8 pb-6">
                   <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="absolute bottom-4 left-4 w-2 h-2 bg-emerald-300 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 
                 {/* Content */}
                 <div className="px-8 pb-8 text-center">
                   <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                     Environmental Care
                   </h3>
                   <p className="text-gray-600 leading-relaxed text-base">
                     Tree plantation, cleanliness drives, and environmental awareness programs.
                   </p>
                 </div>
                 
                 {/* Bottom Decoration */}
                 <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-400"></div>
               </div>
             </div>
             
             <div className="group relative">
               {/* Health & Wellness Card */}
               <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-100">
                 {/* Image Header */}
                 <div className="relative h-48 overflow-hidden">
                   <img 
                     src="/health.jpg" 
                     alt="Health & Wellness"
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onError={(e) => {
                       e.target.src = '/default-card.jpg';
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 </div>
                 
                 {/* Decorative Elements */}
                 <div className="relative p-8 pb-6">
                   <div className="absolute top-4 right-4 w-3 h-3 bg-red-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-300 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 
                 {/* Content */}
                 <div className="px-8 pb-8 text-center">
                   <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                     Health & Wellness
                   </h3>
                   <p className="text-gray-600 leading-relaxed text-base">
                     Blood donation camps, health awareness, and medical assistance programs.
                   </p>
                 </div>
                 
                 {/* Bottom Decoration */}
                 <div className="h-2 bg-gradient-to-r from-red-400 to-pink-400"></div>
               </div>
             </div>
             
             <div className="group relative">
               {/* Education Support Card */}
               <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-100">
                 {/* Image Header */}
                 <div className="relative h-48 overflow-hidden">
                   <img 
                     src="/edu.jpg" 
                     alt="Education Support"
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onError={(e) => {
                       e.target.src = '/default-card.jpg';
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 </div>
                 
                 {/* Decorative Elements */}
                 <div className="relative p-8 pb-6">
                   <div className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <div className="absolute bottom-4 left-4 w-2 h-2 bg-violet-300 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 
                 {/* Content */}
                 <div className="px-8 pb-8 text-center">
                   <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                     Education Support
                   </h3>
                   <p className="text-gray-600 leading-relaxed text-base">
                     Teaching programs, skill development, and educational support for underprivileged.
                   </p>
                 </div>
                 
                 {/* Bottom Decoration */}
                 <div className="h-2 bg-gradient-to-r from-purple-400 to-violet-400"></div>
               </div>
             </div>
           </div>
           
           {/* Bottom Call to Action */}
           <div className="text-center mt-8">
             <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 border border-blue-200 shadow-lg">
               <span className="text-blue-600 font-semibold">Ready to serve?</span>
               <Link
                 to="/volunteer/register"
                 className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
               >
                 Join Our Mission
               </Link>
             </div>
           </div>
         </div>
       </section>

             {/* Call to Action Section - Clean & Professional */}
       <section className="relative bg-white py-16">
         <div className="max-w-4xl mx-auto px-6 text-center">
           <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               Ready to Make a Difference?
             </h2>
             <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
               Join our NSS community and contribute to society through meaningful service activities.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link
                 to="/volunteer/register"
                 onClick={handleJoinNSSClick}
                 className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                   isApprovedVolunteer 
                     ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:from-emerald-600 hover:to-green-700' 
                     : 'bg-blue-600 text-white hover:bg-blue-700'
                 }`}
               >
                 {isApprovedVolunteer ? 'Already a Volunteer' : 'Join NSS Today'}
               </Link>
               <Link
                 to="/about"
                 className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
               >
                 Learn More
               </Link>
             </div>
           </div>
         </div>
       </section>

       {/* Scroll to Top Button */}
       {showScrollTop && (
         <button
           onClick={scrollToTop}
           className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce"
           aria-label="Scroll to top"
         >
           <ArrowUp className="h-6 w-6" />
         </button>
       )}
    </div>
  );
};

export default Home;
