import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = "h-8 w-8", className = "" }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${size}`} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
      <div className="h-64 bg-gray-200 rounded mt-6"></div>
    </div>
  );
}
