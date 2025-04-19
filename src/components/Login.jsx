import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import loginImage from '../assets/images/login.png';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (!token || !user || !user.role) {
        throw new Error('Invalid response data');
      }

      // Store token
      localStorage.setItem('token', token);
      
      // Set user in context/state
      setUser(user);

      // Log for debugging
      console.log('Login successful:', { role: user.role, token });

      // Navigate based on role (use lowercase for consistency)
      switch (user.role.toLowerCase()) {
        case 'customer':
          navigate('/customer', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'supervisor':
          navigate('/supervisor', { replace: true });
          break;
        default:
          throw new Error('Invalid user role');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl w-full mx-4 flex gap-8 items-center">
        {/* Left side - Image/Illustration */}
        <div className="hidden lg:block w-1/2 transform transition-all duration-500 hover:scale-105">
          <img 
            src={loginImage}
            alt="Login illustration" 
            className="w-full h-auto"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 transform transition-all duration-500 hover:translate-y-[-5px]">
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Please sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg p-8 rounded-lg shadow-2xl border border-green-100 animate-slideUp">
            <div className="space-y-6">
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:shadow-md"
                />
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:shadow-md"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6 animate-fadeIn">
            <p className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-300">
              Need help? Contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;