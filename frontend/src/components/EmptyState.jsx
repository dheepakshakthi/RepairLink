import React from 'react';

export function EmptyState({ title, description, icon, action }) {
  return (
    <div className="text-center p-12 bg-white rounded-lg border border-gray-200 border-dashed">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4 text-gray-500">
        {icon}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
