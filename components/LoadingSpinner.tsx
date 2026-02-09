import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "正在翻阅史书..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-red-800 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-calligraphy text-2xl text-red-900">
          史
        </div>
      </div>
      <p className="text-stone-600 font-serif animate-pulse">{message}</p>
    </div>
  );
};