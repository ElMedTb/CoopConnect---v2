import React from 'react';

/**
 * Professional loading spinner component with smooth animations.
 * Shows loading state with multiple animation patterns.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const animationClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} ${animationClasses.spin} rounded-full border-4 border-gray-200 border-t-gray-200`}>
        <div className="border-4 border-t-gray-200 rounded-full w-3/4 h-3/4 border-gray-300"></div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm font-medium text-gray-600">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
