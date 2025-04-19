import React, { useState, useEffect } from 'react';
import api from '../api';

const ComplaintForm = ({ onComplaintSubmitted }) => {
  const [complaint, setComplaint] = useState({
    supervisorId: '',
    subject: '',
    description: ''
  });
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api.get('/users/supervisors', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSupervisors(response.data);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch supervisors. Please try again.');
      }
    };
    fetchSupervisors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaint(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/complaint', complaint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response:', response.data);
      
      // Clear form
      setComplaint({
        supervisorId: '',
        subject: '',
        description: ''
      });
      
      // Show success message
      alert('Complaint submitted successfully!');
      
      // Notify parent component to refresh complaints list
      if (onComplaintSubmitted) {
        onComplaintSubmitted();
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to raise complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 py-6 px-8">
            <h2 className="text-2xl font-bold text-white">Raise a Complaint</h2>
            <p className="mt-2 text-green-100">Please fill in the details below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Supervisor Selection */}
            <div>
              <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Supervisor
              </label>
              <select
                id="supervisorId"
                name="supervisorId"
                value={complaint.supervisorId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor._id} value={supervisor._id}>
                    {supervisor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={complaint.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief subject of your complaint"
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={complaint.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Detailed description of your complaint"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;