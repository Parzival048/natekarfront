import React, { useState, useEffect, useCallback } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const CustomerDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [activeTab, setActiveTab] = useState('newComplaint');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const [userResponse, complaintsResponse] = await Promise.all([
        api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/complaint/user', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            status: filterStatus,
            search: searchTerm,
            limit: 10
          }
        })
      ]);

      setUserInfo(userResponse.data);
      setComplaints(complaintsResponse.data.complaints);
      setTotalPages(complaintsResponse.data.totalPages);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
        return;
      }
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleComplaintSubmitted = () => {
    setActiveTab('history');
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo({ name: '', email: '', department: '' });
    setUser(null);
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome, {userInfo.name || 'Guest'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          {/* User Info Card */}
          <div className="mt-4 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{userInfo.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Complaints</p>
                <p className="font-medium">{complaints.length}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'newComplaint'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
                onClick={() => setActiveTab('newComplaint')}
              >
                New Complaint
              </button>
              <button
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
                onClick={() => setActiveTab('history')}
              >
                Complaint History
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'newComplaint' ? (
          <ComplaintForm onComplaintSubmitted={handleComplaintSubmitted} />
        ) : (
          <div className="bg-white shadow rounded-lg">
            {/* Search and Filter Controls */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={handleStatusFilter}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Complaints List */}
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No complaints found.
              </div>
            ) : (
              <>
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{complaint.subject}</h3>
                        <p className="mt-1 text-sm text-gray-500">{complaint.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <p>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                          {complaint.resolvedAt && (
                            <p>Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                          )}
                          {complaint.response && (
                            <p className="text-blue-600">Response: {complaint.response}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {/* Pagination buttons */}
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;