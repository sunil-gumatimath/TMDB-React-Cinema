import React from 'react';

const MovieSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-700 rounded-lg aspect-[2/3] mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-700 rounded w-8"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
          <div className="h-3 bg-gray-700 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
};

export default MovieSkeleton;
