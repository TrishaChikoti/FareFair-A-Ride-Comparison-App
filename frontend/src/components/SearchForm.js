import React, { useState } from 'react';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { useRide } from '../context/RideContext';
import VehicleSelector from './VehicleSelector';
import { toast } from 'react-toastify';

const SearchForm = () => {
  const { searchRides, loading, setSearchQuery } = useRide();
  const [formData, setFormData] = useState({
    from: { address: '', coordinates: { lat: '', lng: '' } },
    to: { address: '', coordinates: { lat: '', lng: '' } },
    vehicleType: 'car'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], address: value }
    }));
  };

  const handleVehicleChange = (vehicleType) => {
    setFormData(prev => ({
      ...prev,
      vehicleType
    }));
  };

  const geocodeAddress = async (address) => {
    // Mock geocoding - in real app, use Google Maps Geocoding API
    const locations = {
      'koramangala': { lat: 12.9352, lng: 77.6245 },
      'mg road': { lat: 12.9758, lng: 77.6033 },
      'whitefield': { lat: 12.9698, lng: 77.7500 },
      'electronic city': { lat: 12.8456, lng: 77.6603 },
      'marathahalli': { lat: 12.9591, lng: 77.6974 },
      'hsr layout': { lat: 12.9116, lng: 77.6370 }
    };

    const key = address.toLowerCase();
    const found = Object.keys(locations).find(k => key.includes(k));

    if (found) {
      return locations[found];
    }

    // Return default coordinates if not found
    return { 
      lat: 12.9716 + (Math.random() - 0.5) * 0.1, 
      lng: 77.5946 + (Math.random() - 0.5) * 0.1 
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from.address || !formData.to.address) {
      toast.error('Please enter both pickup and drop locations');
      return;
    }

    try {
      // Geocode addresses
      const fromCoords = await geocodeAddress(formData.from.address);
      const toCoords = await geocodeAddress(formData.to.address);

      const searchData = {
        from: {
          address: formData.from.address,
          coordinates: fromCoords
        },
        to: {
          address: formData.to.address,
          coordinates: toCoords
        },
        vehicleType: formData.vehicleType
      };

      await searchRides(searchData);
    } catch (error) {
      toast.error('Failed to search rides');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find Your Best Ride
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type Selector */}
        <VehicleSelector 
          selectedVehicle={formData.vehicleType}
          onVehicleChange={handleVehicleChange}
        />

        {/* Location Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiMapPin className="absolute left-3 top-3 text-green-500" size={20} />
            <input
              type="text"
              placeholder="Pickup location"
              value={formData.from.address}
              onChange={(e) => handleInputChange('from', e.target.value)}
              className="input pl-10"
              required
            />
          </div>

          <div className="relative">
            <FiMapPin className="absolute left-3 top-3 text-red-500" size={20} />
            <input
              type="text"
              placeholder="Drop location"
              value={formData.to.address}
              onChange={(e) => handleInputChange('to', e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary flex items-center justify-center space-x-2 py-3 text-lg"
        >
          {loading ? (
            <div className="spinner w-5 h-5"></div>
          ) : (
            <>
              <FiSearch />
              <span>Search Rides</span>
            </>
          )}
        </button>
      </form>

      {/* Popular Locations */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Popular locations:</h3>
        <div className="flex flex-wrap gap-2">
          {['Koramangala', 'MG Road', 'Whitefield', 'Electronic City', 'Marathahalli', 'HSR Layout'].map((location) => (
            <button
              key={location}
              onClick={() => {
                if (!formData.from.address) {
                  handleInputChange('from', location);
                } else if (!formData.to.address) {
                  handleInputChange('to', location);
                }
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {location}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
