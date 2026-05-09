import React from 'react';
import { Smartphone, Laptop, Monitor, Gamepad2 } from 'lucide-react';

export function DeviceIcon({ type, className = "h-5 w-5" }) {
  switch (type) {
    case 'mobile':
      return <Smartphone className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'pc':
      return <Monitor className={className} />;
    case 'console':
      return <Gamepad2 className={className} />;
    default:
      return <Smartphone className={className} />;
  }
}
