export const DEVICE_TYPES = ['mobile', 'laptop', 'pc', 'console'];
export const DEVICE_TYPE_LABELS = { mobile: 'Mobile Phone', laptop: 'Laptop', pc: 'PC / Desktop', console: 'Gaming Console' };
export const DEVICE_TYPE_CODES = { mobile: 'MOB', laptop: 'LAP', pc: 'PC', console: 'CON' };

export const TICKET_STATUSES = [
  'open', 'bids_received', 'assigned', 'pickup_scheduled',
  'device_in_transit', 'device_received', 'in_repair',
  'repair_complete', 'return_in_transit', 'delivered',
  'closed', 'cancelled', 'disputed', 'no_bids'
];

export const STATUS_LABELS = {
  open: 'Open', bids_received: 'Bids Received', assigned: 'Assigned',
  pickup_scheduled: 'Pickup Scheduled', device_in_transit: 'Device in Transit',
  device_received: 'Device Received', in_repair: 'In Repair',
  repair_complete: 'Repair Complete', return_in_transit: 'Return in Transit',
  delivered: 'Delivered', closed: 'Closed', cancelled: 'Cancelled',
  disputed: 'Disputed', no_bids: 'No Bids Received'
};

export const STATUS_COLORS = {
  open: 'blue', bids_received: 'blue', assigned: 'green',
  pickup_scheduled: 'amber', device_in_transit: 'amber',
  device_received: 'amber', in_repair: 'amber',
  repair_complete: 'purple', return_in_transit: 'purple',
  delivered: 'green', closed: 'gray', cancelled: 'red',
  disputed: 'red', no_bids: 'gray'
};

export const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Happy to wait 5–7 days' },
  { value: 'medium', label: 'Medium', description: 'Need it within 3–4 days' },
  { value: 'high', label: 'High', description: 'Urgent — within 1–2 days' }
];

export const ROLES = { CUSTOMER: 'customer', PROVIDER: 'provider', ADMIN: 'admin' };
