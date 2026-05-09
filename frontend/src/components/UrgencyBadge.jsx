import React from 'react';

export function UrgencyBadge({ urgency }) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800'
  };

  const labels = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'Urgent'
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded ${colors[urgency] || colors.medium}`}>
      {labels[urgency] || urgency}
    </span>
  );
}
