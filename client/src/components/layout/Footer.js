import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* NSS GEHU BHimtal Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg mr-4">
                <img src="/images.png" alt="NSS Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">NSS GEHU Bhimtal Unit</h2>
                <p className="text-sm text-gray-400">National Service Scheme</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Empowering students to serve society through volunteerism, community engagement, 
              and social responsibility. Join us in making a difference in our community.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/gehunss.official/" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:gehunss@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white text-left">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-left">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                Home
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                About Us
              </Link>
              <Link to="/events" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                Events
              </Link>
              <Link to="/gallery" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                Gallery
              </Link>
              <Link to="/teams" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                Teams
              </Link>
              <Link to="/volunteer/register" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline">
                Join NSS
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start text-gray-300 justify-end">
                <div className="text-right">
                  <p className="font-medium text-white">Address</p>
                  <p className="text-sm">GEHU BHimtal Campus,<br />Nainital, Uttarakhand</p>
                </div>
                <MapPin className="w-5 h-5 ml-3 text-blue-400 mt-0.5 flex-shrink-0" />
              </div>
              <div className="flex items-start text-gray-300 justify-end">
                <div className="text-right">
                  <p className="font-medium text-white">Phone</p>
                  <p className="text-sm">+91 7409097357</p>
                </div>
                <Phone className="w-5 h-5 ml-3 text-green-400 mt-0.5 flex-shrink-0" />
              </div>
              <div className="flex items-start text-gray-300 justify-end">
                <div className="text-right">
                  <p className="font-medium text-white">Email</p>
                  <p className="text-sm">nss@gehu.ac.in</p>
                </div>
                <Mail className="w-5 h-5 ml-3 text-purple-400 mt-0.5 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} NSS GEHU Bhimtal. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                National Service Scheme - Graphic Era Hill University , Bhimtal
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:underline">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
