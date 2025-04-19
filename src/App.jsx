import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register'; // Import the Register component
import SupervisorDashboard from './pages/SupervisorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import api from './api'; // Ensure this path is correct

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user && user.role ? 
            <Navigate to={`/${user.role.toLowerCase()}`} /> : 
            <Login setUser={setUser} />
          } 
        />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/supervisor" 
          element={
            user?.role === 'supervisor' ? 
            <SupervisorDashboard /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/customer" 
          element={
            user?.role === 'customer' ? 
            <CustomerDashboard setUser={setUser} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/admin" 
          element={
            user?.role === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to="/" />
          } 
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;