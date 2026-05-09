import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || 'gray';
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[color]}`}>
      {label}
    </span>
  );
}
