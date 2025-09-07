// 📢 ANNOUNCEMENT CONFIGURATION
// This file contains simple settings for announcement expiry
// Anyone can easily modify these values

export const ANNOUNCEMENT_CONFIG = {
  // How often to check for expired announcements (in minutes)
  CHECK_INTERVAL_MINUTES: 5,
  
  // How many announcements to fetch for checking expiry
  FETCH_LIMIT: 5,
  
  // Whether to show expired count in announcements page
  SHOW_EXPIRED_COUNT: true,
  
  // Whether to automatically hide expired announcements
  AUTO_HIDE_EXPIRED: true,
  
  // Custom expiry message
  EXPIRED_MESSAGE: "expired announcement",
  EXPIRED_MESSAGE_PLURAL: "expired announcements",
  HIDDEN_MESSAGE: "hidden"
};

// 🎯 HOW TO CUSTOMIZE:
// 1. Change CHECK_INTERVAL_MINUTES to check more/less frequently
// 2. Change FETCH_LIMIT to fetch more/fewer announcements
// 3. Set SHOW_EXPIRED_COUNT to false to hide the count message
// 4. Set AUTO_HIDE_EXPIRED to false to show expired announcements
// 5. Change the messages to your preferred language
