# Quick Reference - Component Usage & Examples

## Component Import Paths

### Auth Components
```javascript
// Login
import Login from '../features/auth/Login';
// Route: /login

// Register  
import Register from '../features/auth/Register';
// Route: /register
```

### Customer Components
```javascript
// Customer Dashboard
import CustomerDashboard from '../features/customer/CustomerDashboard';
// Route: /customer/dashboard
```

### Utility Files
```javascript
// Utility functions
import { cn } from '../lib/utils';
// Used for merging Tailwind classes

// UI Components
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

// Status Components
import { StatusBadge } from '../components/StatusBadge';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
```

---

## Complete Routes Configuration

### Updated AppRoutes.jsx
Location: `frontend/src/routes/AppRoutes.jsx`

The routes file has been updated with the following structure:

```javascript
// Public Routes (No authentication required)
GET /                          → Redirects to /login
GET /login                      → Login page
GET /register                   → Register page  
GET /unauthorized               → Unauthorized page

// Protected Customer Routes
GET /customer/dashboard         → Customer Dashboard (requires auth + customer role)

// Protected Provider Routes  
GET /provider/*                 → Provider Dashboard (requires auth + provider role)

// Protected Admin Routes
GET /admin/*                    → Admin Dashboard (requires auth + admin role)

// Catch All
GET /*                          → Redirects to /login
```

---

## Redux State Shape (Auth Slice)

```javascript
{
  auth: {
    user: {
      _id: "user_id",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      role: "customer" | "provider" | "admin",
      avatar: "url_or_null",
      isVerified: true,
      isActive: true,
      createdAt: "2024-05-10T10:00:00Z",
      updatedAt: "2024-05-10T10:00:00Z"
    },
    accessToken: "jwt_token_string",
    isAuthenticated: true,
    loading: false,
    error: null
  }
}
```

---

## RTK Query Endpoints Used

### TicketsApi (`services/ticketsApi.js`)

```javascript
// Hook: useGetMyTicketsQuery
// Usage: 
const { data, isLoading, error } = useGetMyTicketsQuery({
  page: 1,
  limit: 50,
  status: 'open', // optional
  sort: '-createdAt' // optional
});

// Returns:
{
  tickets: [
    {
      _id: "ticket_id",
      ticketNo: "TKT-001",
      customerId: "user_id",
      deviceType: "mobile" | "laptop" | "pc" | "console",
      deviceBrand: "Apple",
      deviceModel: "iPhone 14",
      issueTitle: "Screen cracked",
      issueDescription: "Large crack on display",
      status: "open" | "bids_received" | ... | "closed",
      urgency: "low" | "medium" | "high",
      finalPrice: 100,
      createdAt: "2024-05-10T10:00:00Z",
      updatedAt: "2024-05-10T10:00:00Z"
    }
  ],
  total: 10,
  pages: 2
}
```

---

## Constants Used

### Device Types (`constants/index.js`)
```javascript
DEVICE_TYPES = ['mobile', 'laptop', 'pc', 'console'];

DEVICE_TYPE_LABELS = {
  mobile: 'Mobile Phone',
  laptop: 'Laptop',
  pc: 'PC / Desktop',
  console: 'Gaming Console'
};
```

### Ticket Statuses
```javascript
TICKET_STATUSES = [
  'open', 'bids_received', 'assigned', 'pickup_scheduled',
  'device_in_transit', 'device_received', 'in_repair',
  'repair_complete', 'return_in_transit', 'delivered',
  'closed', 'cancelled', 'disputed', 'no_bids'
];

STATUS_LABELS = {
  open: 'Open',
  bids_received: 'Bids Received',
  assigned: 'Assigned',
  // ... etc
};

STATUS_COLORS = {
  open: 'blue',
  bids_received: 'blue',
  assigned: 'green',
  // ... etc
};
```

### Urgency Options
```javascript
URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Happy to wait 5–7 days' },
  { value: 'medium', label: 'Medium', description: 'Need it within 3–4 days' },
  { value: 'high', label: 'High', description: 'Urgent — within 1–2 days' }
];
```

---

## Common Code Snippets

### Using useNavigate in Components
```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/customer/dashboard');
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Using useSelector for Auth
```javascript
import { useSelector } from 'react-redux';

function MyComponent() {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <div>Welcome {user.name}</div>;
}
```

### Dispatching Auth Actions
```javascript
import { useDispatch } from 'react-redux';
import { login, logout, register } from '../features/auth/authSlice';

function MyComponent() {
  const dispatch = useDispatch();

  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <button onClick={() => handleLogin({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
```

### Using RTK Query Hooks
```javascript
import { useGetMyTicketsQuery } from '../services/ticketsApi';

function MyComponent() {
  const { data, isLoading, error, refetch } = useGetMyTicketsQuery({
    page: 1,
    limit: 10
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading tickets</div>;

  return (
    <div>
      {data.tickets.map(ticket => (
        <div key={ticket._id}>{ticket.ticketNo}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Form Validation with react-hook-form + Zod
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters')
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
      
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Environment Variables

### .env File
```
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

# Application
VITE_APP_NAME=RepairLink
VITE_APP_VERSION=1.0.0
```

---

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

### 4. Lint Code
```bash
npm run lint
```

---

## Component Prop Types (JavaScript)

### Button
```javascript
<Button
  variant="default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size="default" | "sm" | "lg" | "icon"
  disabled={boolean}
  onClick={function}
>
  Content
</Button>
```

### Card
```javascript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input
```javascript
<Input
  type="text" | "email" | "password" | "tel" | etc
  placeholder="Placeholder text"
  disabled={boolean}
  value={string}
  onChange={function}
  {...register('fieldName')} // For react-hook-form
/>
```

### StatusBadge
```javascript
<StatusBadge
  status="open" | "assigned" | "closed" | ... // from TICKET_STATUSES
/>
```

### UrgencyBadge
```javascript
<UrgencyBadge
  urgency="low" | "medium" | "high"
/>
```

### LoadingSpinner
```javascript
<LoadingSpinner
  size="h-8 w-8" // default
  className="additional classes"
/>
```

---

## Common Patterns

### Conditional Rendering
```javascript
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <div className="error">Error message</div>
) : data.length === 0 ? (
  <EmptyState title="No items" description="Create your first item" />
) : (
  <div>List of items</div>
)}
```

### Form Field with Error
```javascript
<div>
  <label htmlFor="email" className="block text-sm font-medium mb-2">
    Email
  </label>
  <Input
    id="email"
    type="email"
    {...register('email')}
    disabled={loading}
  />
  {errors.email && (
    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
  )}
</div>
```

### Protected Route
```javascript
<ProtectedRoute allowedRoles={['customer']}>
  <CustomerDashboard />
</ProtectedRoute>
```

---

## Debugging Tips

### 1. Redux DevTools
```bash
npm install --save-dev @redux-devtools/extension
```

### 2. Check Redux State
```javascript
import { useSelector } from 'react-redux';

function DebugComponent() {
  const state = useSelector(state => state);
  console.log('Current state:', state);
  return null;
}
```

### 3. Check RTK Query Cache
```javascript
import { useSelector } from 'react-redux';

function DebugRTKQuery() {
  const rtkQueryCache = useSelector(state => state.api);
  console.log('RTK Query cache:', rtkQueryCache);
  return null;
}
```

### 4. Network Tab
- Open DevTools → Network tab
- Check API requests and responses
- Verify token is being sent in Authorization header

---

## Production Checklist

- [ ] Environment variables configured
- [ ] API URL pointing to production backend
- [ ] Token refresh logic working
- [ ] Error boundaries in place
- [ ] Loading states visible
- [ ] Responsive design tested
- [ ] Browser compatibility tested
- [ ] Performance optimized (no console logs)
- [ ] Security checked (no credentials exposed)
- [ ] Build successful with no warnings
- [ ] Deployed to production environment

---

## Next Components to Build

Based on the project roadmap, these are the recommended next components:

1. **Forgot Password Page** - Email-based password reset
2. **Email Verification Page** - Verify email after registration
3. **Create Ticket Page** - Multi-step form for creating repair requests
4. **My Tickets Page** - List of all customer tickets with filtering
5. **Ticket Detail Page** - Full ticket view with real-time updates
6. **Provider Browse Page** - Search and filter service providers
7. **Delivery Tracker Page** - Track package delivery
8. **Notifications Center** - View all notifications
9. **User Profile Page** - Edit profile and preferences
10. **Provider Dashboard** - Dashboard for service providers

---

## Resources

- [React Documentation](https://react.dev)
- [React Router v7](https://reactrouter.com)
- [Redux Documentation](https://redux.js.org)
- [RTK Query Guide](https://redux-toolkit.js.org/rtk-query/overview)
- [react-hook-form Guide](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
