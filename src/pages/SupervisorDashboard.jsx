import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiCalendar,
  FiUser,
  FiTrash,
  FiRefreshCw,
  FiTruck,
  FiLoader,
  FiLogOut
} from 'react-icons/fi';

function SupervisorDashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cleaning: false,
    sweeping: false,
    mopping: false
  });
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage({
          text: 'Error fetching user profile',
          type: 'error'
        });
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?._id) {
      setMessage({ text: 'User ID not found. Please log in again.', type: 'error' });
      return;
    }

    if (!Object.values(formData).some(Boolean)) {
      setMessage({ text: 'Please select at least one task.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceData = {
        supervisorId: user._id,
        date: today.toISOString(),
        cleaning: formData.cleaning,
        sweeping: formData.sweeping,
        mopping: formData.mopping
      };

      await api.post('/attendance/mark-attendance', attendanceData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMessage({ text: 'Attendance marked successfully!', type: 'success' });
      setFormData({ cleaning: false, sweeping: false, mopping: false });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Error marking attendance',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-md mx-auto py-8 px-4">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiCalendar className="mr-2" /> Daily Waste Collection Log
              </h2>
              
              <div className="flex items-center">
                {user && (
                  <>
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="ml-2 text-white text-sm font-medium">{user.name}</span>
                  </>
                )}
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-4 p-1 rounded-full hover:bg-green-500 hover:bg-opacity-20 transition"
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-green-800 uppercase tracking-wider">
                  Completed Tasks
                </h3>
                
                {/* Cleaning Task */}
                <label className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                  formData.cleaning 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    name="cleaning"
                    checked={formData.cleaning}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center">
                    <FiTrash className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Cleaning</span>
                  </div>
                </label>
                
                {/* Sweeping Task */}
                <label className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                  formData.sweeping 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    name="sweeping"
                    checked={formData.sweeping}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center">
                    <FiTruck className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Sweeping</span>
                  </div>
                </label>
                
                {/* Mopping Task */}
                <label className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                  formData.mopping 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    name="mopping"
                    checked={formData.mopping}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center">
                    <FiRefreshCw className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Mopping</span>
                  </div>
                </label>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                } transition-colors duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" />
                    Submit Daily Report
                  </>
                )}
              </button>
            </form>
            
            {/* Message Alert */}
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                message.type === 'error' 
                  ? 'bg-red-50 border-l-4 border-red-500' 
                  : 'bg-green-50 border-l-4 border-green-500'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {message.type === 'error' ? (
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      message.type === 'error' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Card Footer */}
          <div className="bg-green-50 px-6 py-3 border-t border-green-100">
            <div className="flex items-center justify-between text-xs text-green-700">
              <span>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span>Waste Management System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
