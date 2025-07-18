import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 50, color = '#3b82f6', text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ClipLoader color={color} size={size} />
      <p className="mt-4 text-gray-600 text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
