import React from 'react';

interface ErrorMessageProps {
    error: Error;
  }

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="mt-2 text-lg text-gray-700">Loading...</p>
  </div>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => (
    <div className="flex flex-col items-center justify-center h-full text-red-600">
      <p className="text-lg font-semibold">Error:</p>
      <p className="mt-2 text-base">{error.message}</p>
    </div>
  );