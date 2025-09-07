// India Post PIN Code API Service
class PinCodeService {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'https://api.postalpincode.in/pincode';
  }

  // Get location details by PIN code
  async getLocationByPinCode(pinCode) {
    // Validate PIN code format (6 digits)
    if (!/^\d{6}$/.test(pinCode)) {
      throw new Error('Invalid PIN code format. Please enter 6 digits.');
    }

    // Check cache first
    if (this.cache.has(pinCode)) {
      return this.cache.get(pinCode);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${pinCode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        
        const locationData = {
          pinCode: pinCode,
          state: postOffice.State,
          district: postOffice.District,
          city: postOffice.Name,
          region: postOffice.Region,
          country: postOffice.Country,
          division: postOffice.Division,
          block: postOffice.Block,
          taluk: postOffice.Taluk
        };

        // Cache the result
        this.cache.set(pinCode, locationData);
        
        return locationData;
      } else {
        throw new Error('PIN code not found or invalid');
      }
    } catch (error) {
      console.error('Error fetching PIN code data:', error);
      throw new Error('Unable to fetch location data. Please check your internet connection.');
    }
  }

  // Get all states (cached)
  async getAllStates() {
    const cacheKey = 'all_states';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // For now, return common Indian states
    // In a real implementation, you might want to fetch this from an API
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    this.cache.set(cacheKey, states);
    return states;
  }

  // Validate PIN code format
  validatePinCode(pinCode) {
    return /^\d{6}$/.test(pinCode);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

// Create singleton instance
const pinCodeService = new PinCodeService();

export default pinCodeService;
