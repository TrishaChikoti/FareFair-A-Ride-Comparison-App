import React from 'react';
import { FiClock, FiStar, FiNavigation2, FiExternalLink } from 'react-icons/fi';
import { useRide } from '../context/RideContext';
import { toast } from 'react-toastify';

const ProviderCard = ({ provider, isRecommended, distance, duration }) => {
  const { selectProvider, searchQuery } = useRide();

  const getProviderDetails = (name) => {
    const details = {
      uber: {
        color: 'bg-black',
        logo: 'U',
        fullName: 'Uber',
        rating: 4.5
      },
      ola: {
        color: 'bg-green-500',
        logo: 'O',
        fullName: 'Ola',
        rating: 4.3
      },
      rapido: {
        color: 'bg-yellow-500',
        logo: 'R',
        fullName: 'Rapido',
        rating: 4.2
      }
    };
    return details[name] || { color: 'bg-gray-500', logo: name[0].toUpperCase(), fullName: name, rating: 4.0 };
  };

  const handleBookRide = async () => {
    try {
      // Record the selection
      await selectProvider(searchQuery.id, provider.name);

      // In a real app, this would redirect to the provider's booking page
      const bookingUrls = {
        uber: 'https://m.uber.com/',
        ola: 'https://book.olacabs.com/',
        rapido: 'https://rapido.bike/'
      };

      const url = bookingUrls[provider.name];
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.info(`Redirecting to ${provider.name} app...`);
      }
    } catch (error) {
      toast.error('Failed to book ride');
    }
  };

  const details = getProviderDetails(provider.name);

  return (
    <div className={`provider-card ${isRecommended ? 'ring-2 ring-green-500' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-2 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Recommended
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Provider Logo */}
          <div className={`w-12 h-12 ${details.color} rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">{details.logo}</span>
          </div>

          {/* Provider Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-800 capitalize">{details.fullName}</h3>
              <div className="flex items-center space-x-1">
                <FiStar className="text-yellow-500" size={16} />
                <span className="text-sm text-gray-600">{details.rating}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <FiClock size={14} />
                <span>{provider.etaPickup} min pickup</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiNavigation2 size={14} />
                <span>{provider.etaDestination} min trip</span>
              </div>
              {provider.vehicleDetails && (
                <span className="text-gray-500">
                  {provider.vehicleDetails.model} • {provider.vehicleDetails.capacity} seats
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="text-right">
          <div className="mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">₹{provider.price}</span>
              {provider.surgeMultiplier > 1 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {provider.surgeMultiplier}x surge
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              ≈ ₹{Math.round(provider.price / distance)}/km
            </div>
          </div>

          <button
            onClick={handleBookRide}
            className="btn btn-primary flex items-center space-x-2 text-sm"
          >
            <span>Book Now</span>
            <FiExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Vehicle Type: {provider.vehicleDetails?.type || 'Standard'}</span>
          <span>ETA: {provider.etaPickup + provider.etaDestination} min total</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
