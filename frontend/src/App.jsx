import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes/AppRoutes';
import { getMe } from './features/auth/authSlice';
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
});

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(getMe());
      socket.auth = { token };
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
