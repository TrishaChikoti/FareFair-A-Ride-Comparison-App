import React, { useState } from 'react';
import { useRide } from '../context/RideContext';
import ProviderCard from './ProviderCard';
import { FiFilter, FiMapPin, FiClock, FiNavigation2 } from 'react-icons/fi';

const RideResults = () => {
  const { searchResults, loading } = useRide();
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Searching for the best fares...</span>
        </div>
      </div>
    );
  }

  if (!searchResults) {
    return null;
  }

  const { from, to, vehicleType, distance, duration, providers } = searchResults;

  // Filter available providers and sort
  const availableProviders = providers.filter(p => p.available);
  const sortedProviders = [...availableProviders].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'time':
        return a.etaPickup - b.etaPickup;
      case 'duration':
        return a.etaDestination - b.etaDestination;
      default:
        return 0;
    }
  });

  const cheapestProvider = availableProviders.reduce((min, p) => 
    p.price < min.price ? p : min, availableProviders[0]);

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Trip Summary</h3>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
            {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FiMapPin className="text-green-500" />
            <span className="text-gray-600">From:</span>
            <span className="font-medium truncate">{from.address}</span>
          </div>

          <div className="flex items-center space-x-2">
            <FiMapPin className="text-red-500" />
            <span className="text-gray-600">To:</span>
            <span className="font-medium truncate">{to.address}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FiNavigation2 className="text-blue-500" />
              <span className="text-gray-600">{distance} km</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="text-orange-500" />
              <span className="text-gray-600">{duration} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="price">Price (Low to High)</option>
              <option value="time">Pickup Time</option>
              <option value="duration">Trip Duration</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FiFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Best Deal</p>
            <p className="text-lg font-bold text-green-700">
              {cheapestProvider ? `₹${cheapestProvider.price} with ${cheapestProvider.name.charAt(0).toUpperCase() + cheapestProvider.name.slice(1)}` : 'No rides available'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Found {availableProviders.length} rides</p>
            <p className="text-sm text-gray-500">
              {providers.length - availableProviders.length > 0 && 
                `${providers.length - availableProviders.length} unavailable`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {sortedProviders.map((provider, index) => (
          <ProviderCard 
            key={`${provider.name}-${index}`}
            provider={provider}
            isRecommended={provider.name === cheapestProvider?.name}
            distance={distance}
            duration={duration}
          />
        ))}
      </div>

      {/* Unavailable Providers */}
      {providers.filter(p => !p.available).length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-700 mb-2">Currently Unavailable</h4>
          <div className="space-y-2">
            {providers.filter(p => !p.available).map((provider, index) => (
              <div key={`unavailable-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">
                      {provider.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 capitalize">{provider.name}</p>
                    <p className="text-sm text-gray-500">{provider.reason || 'No rides available'}</p>
                  </div>
                </div>
                <span className="text-gray-400">Unavailable</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RideResults;
