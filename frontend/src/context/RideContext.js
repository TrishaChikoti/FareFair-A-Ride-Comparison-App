import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RideContext = createContext();

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

export const RideProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    from: { address: '', coordinates: { lat: '', lng: '' } },
    to: { address: '', coordinates: { lat: '', lng: '' } },
    vehicleType: 'car'
  });

  const searchRides = async (searchData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/rides/search', searchData);
      setSearchResults(response.data.data);
      setSearchQuery(searchData);
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Search failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const selectProvider = async (queryId, provider) => {
    try {
      await axios.post('/api/rides/select', { queryId, provider });
      toast.success(`Selected ${provider}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Selection failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getRideHistory = async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/rides/history?page=${page}&limit=${limit}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch history';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getPopularRoutes = async () => {
    try {
      const response = await axios.get('/api/rides/popular');
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch popular routes';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearResults = () => {
    setSearchResults(null);
    setSearchQuery({
      from: { address: '', coordinates: { lat: '', lng: '' } },
      to: { address: '', coordinates: { lat: '', lng: '' } },
      vehicleType: 'car'
    });
  };

  const value = {
    searchResults,
    searchQuery,
    loading,
    searchRides,
    selectProvider,
    getRideHistory,
    getPopularRoutes,
    clearResults,
    setSearchQuery
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};
