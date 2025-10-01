import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Heart, 
  Globe, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Star,
  Trophy,
  Sparkles,
  Target,
  Eye,
  Quote,
  ArrowUp
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

// Custom CSS for animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }
`;

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const objectives = [
    {
      icon: Heart,
      title: 'Community Service',
      description: 'Engage students in meaningful community service activities that address local needs.',
      color: 'from-red-100 to-pink-100',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Users,
      title: 'Leadership Development',
      description: 'Develop leadership qualities and organizational skills through practical experience.',
      color: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Globe,
      title: 'Social Awareness',
      description: 'Create awareness about social issues and promote civic responsibility.',
      color: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Award,
      title: 'Skill Enhancement',
      description: 'Enhance communication, teamwork, and problem-solving skills.',
      color: 'from-purple-100 to-violet-100',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const programmeOfficers = [
    {
      name: 'Dr. Sandeep Kumar Budhani',
      role: 'Ex-Programme Officer',
      photo: '/Sd.jpg',
      words: '"NSS is not just about community service, it\'s about building character and leadership. Through our initiatives, we aim to create responsible citizens who understand the value of giving back to society."'
    },
    {
      name: 'Dr. Santoshi Sen Gupta',
      role: 'Programme Officer',
      photo: '/Sm.jpg',
      words: '"Our NSS unit focuses on holistic development of students. We believe in empowering youth to become agents of positive change in their communities."'
    },
    {
      name: 'Dr. Amit Mittal',
      role: 'Associate Programme Officer',
      photo: '/Am.jpg',
      words: '"The true essence of NSS lies in selfless service. We encourage students to step out of their comfort zones and make meaningful contributions to society."'
    }
  ];

  const achievements = [
    {
      year: '2024',
      title: 'Best NSS Unit Award',
      description: 'Recognized by the Ministry of Youth Affairs & Sports for outstanding community service.',
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      year: '2023',
      title: 'Environmental Excellence',
      description: 'Successfully planted 1000+ trees and conducted 20+ cleanliness drives.',
      icon: Globe,
      color: 'from-green-400 to-emerald-500'
    },
    {
      year: '2023',
      title: 'Health Initiative Award',
      description: 'Organized blood donation camps with 500+ donors and health awareness programs.',
      icon: Heart,
      color: 'from-red-400 to-pink-500'
    },
    {
      year: '2022',
      title: 'Community Impact',
      description: 'Served 10+ villages through education support and skill development programs.',
      icon: Users,
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <>
      <style>{customStyles}</style>
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Hero Section */}
        <section className="relative bg-cover bg-center bg-no-repeat text-white py-20 overflow-hidden" style={{
          backgroundImage: `url('/cholliyar.jpg')`
        }}>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

            
            {/* Main Title with better contrast */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white drop-shadow-2xl" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
            About NSS
          </h1>
            
            {/* Simple separator */}
            <div className="w-40 h-1 bg-white mx-auto mb-8 rounded-full shadow-lg"></div>
            
            {/* Description with better contrast */}
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl lg:text-2xl text-white font-semibold leading-relaxed" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
            The National Service Scheme (NSS) is a government-sponsored public service program 
            that aims to instill the idea of social welfare in students and provide service to society.
          </p>
            </div>
            
            {/* Enhanced floating elements with better contrast */}
            <div className="absolute top-24 left-24 w-4 h-4 bg-yellow-400/80 rounded-full animate-bounce shadow-lg"></div>
            <div className="absolute top-36 right-36 w-3 h-3 bg-orange-400/80 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute bottom-24 left-1/3 w-2 h-2 bg-red-400/80 rounded-full animate-bounce shadow-lg"></div>
        </div>
      </section>

      {/* Our Purpose */}
        <section className="py-6 bg-gradient-to-br from-gray-200 via-blue-200 to-gray-200 relative overflow-hidden">
          {/* Gradient Overlay for Smooth Transition */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 via-black/10 to-transparent"></div>
          {/* Background Vectors */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 opacity-30">
              <img src="/vectora.png" alt="" className="w-60 h-60 object-contain" />
            </div>
            <div className="absolute bottom-10 right-10 opacity-30">
              <img src="/vectorb.png" alt="" className="w-64 h-64 object-contain" />
            </div>
            <div className="absolute top-1/2 left-1/4 opacity-20">
              <img src="/vectora.png" alt="" className="w-40 h-40 object-contain" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 opacity-25">
              <img src="/vectorb.png" alt="" className="w-48 h-48 object-contain" />
            </div>
            <div className="absolute top-1/4 right-1/4 opacity-25">
              <img src="/cld.png" alt="" className="w-52 h-52 object-contain" />
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2 tracking-tight">
                Our Purpose
              </h2>
              <p className="text-base text-gray-600 max-w-xl mx-auto font-medium">
                Discover the core values that drive NSS GEHU Bhimtal towards community service and social development
              </p>
            </div>
            
            {/* N S S Buttons */}
            <div className="flex justify-center space-x-6 mb-4">
                 <button 
                   onClick={() => setActiveTab('mission')}
                className={`text-3xl font-black transition-all duration-300 hover:scale-105 ${
                  activeTab === 'mission' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                N
                 </button>
               
                 <button 
                   onClick={() => setActiveTab('vision')}
                className={`text-3xl font-black transition-all duration-300 hover:scale-105 ${
                  activeTab === 'vision' ? 'text-purple-600' : 'text-gray-400 hover:text-purple-500'
                }`}
              >
                S
                 </button>
              
                <button 
                  onClick={() => setActiveTab('motto')}
                className={`text-3xl font-black transition-all duration-300 hover:scale-105 ${
                  activeTab === 'motto' ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
                }`}
              >
                S
                </button>
              </div>
              
            {/* Content Display */}
            <div className="text-center min-h-[120px]">
              <div className={`transition-all duration-500 ease-in-out transform ${
                activeTab === 'mission' ? 'translate-y-0 opacity-100 scale-100' : 
                activeTab === 'vision' ? 'translate-y-0 opacity-100 scale-100' : 
                activeTab === 'motto' ? 'translate-y-0 opacity-100 scale-100' :
                'translate-y-8 opacity-60 scale-98'
                  }`}>
                    
                    {/* Mission Content */}
                    {activeTab === 'mission' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 tracking-wide">
                          Our Mission
                        </h3>
                    <p className="text-gray-700 leading-relaxed text-md max-w-4xl mx-auto font-medium">
                      To help youth learn through serving others, understand their community, and act responsibly with caring and teamwork.
                        </p>
            </div>
                    )}
                    
                    {/* Vision Content */}
                    {activeTab === 'vision' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 tracking-wide">
                          Our Vision
                </h3>
                    <p className="text-gray-600 leading-relaxed text-md max-w-2xl mx-auto font-medium">
                      At NSS, GEHU Bhimtal, we aim to build a society where people understand their social duties and work to shape caring leaders.
                        </p>
                  </div>
                    )}
                    
                    {/* Motto Content */}
                    {activeTab === 'motto' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 tracking-wide">
                          Our Motto
                        </h3>
                    <p className="text-gray-600 leading-relaxed text-md max-w-2xl mx-auto font-bold ">
                    "Not Me, But You" - emphasizing selfless service to others
                  </p>
                </div>
                    )}
              </div>
          </div>
          {/* Bottom Gradient Overlay for Smooth Transition */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/80 via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Objectives */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700">Our Goals</span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Objectives
            </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NSS aims to develop the personality and character of students through community service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {objectives.map((objective, index) => {
              const Icon = objective.icon;
              return (
                  <div key={index} className="group relative">
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 h-full">
                      <div className="p-8 text-center flex flex-col justify-between h-full">
                        <div>
                          <div className={`w-20 h-20 bg-gradient-to-br ${objective.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-10 h-10 ${objective.iconColor}`} />
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                            {objective.title}
                          </h3>
                          
                          <p className="text-gray-600 leading-relaxed">
                            {objective.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bottom Decoration */}
                      <div className={`h-1 bg-gradient-to-r ${objective.color.replace('100', '400')}`}></div>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
        <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              
              
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Programme Officers
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Meet our dedicated Programme Officers who guide and inspire NSS activities
                </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programmeOfficers.map((officer, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 h-full">
                  <div className="p-8 text-center flex flex-col justify-between min-h-[500px]">
                    {/* Officer Photo */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={officer.photo} 
                        alt={officer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Officer Details */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {officer.name}
                    </h3>
                    
                    <p className="text-blue-600 font-semibold mb-2 text-lg">
                      {officer.role}
                    </p>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {officer.department}
                    </p>
                    
                    {/* Officer's Words - Enhanced Design */}
                    <div className="mt-6 relative">

                      
                      {/* Words Container */}
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pt-8 rounded-2xl border border-blue-200 shadow-lg relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full opacity-30"></div>
                        
                        {/* Words Text */}
                        <p className="text-gray-800 text-base leading-relaxed font-medium relative z-10 text-center">
                          {officer.words}
                        </p>
                        
                        {/* Bottom Accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Decoration */}
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                </div>
              </div>
            ))}
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
    </>
  );
};

export default About;
