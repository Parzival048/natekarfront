import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintList from '../components/ComplaintList';
import api from '../api';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUsers, 
  FiClipboard, 
  FiCalendar,
  FiHome,
  FiSun,
  FiCheckSquare,
  FiSearch,
  FiFilter,
  FiDownload,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    taskCompletion: {
      cleaning: 0,
      sweeping: 0,
      mopping: 0 
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      // Optional: Call logout API if needed
      // await api.post('/auth/logout', {}, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/complaint', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setIsAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await api.get('/attendance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: today.toISOString() }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }

      const attendanceWithUserDetails = response.data.map(record => ({
        _id: record._id,
        date: new Date(record.date),
        cleaning: record.cleaning,
        sweeping: record.sweeping,
        mopping: record.mopping,
        supervisorName: record.supervisorId?.name || 'Unknown',
        supervisorEmail: record.supervisorId?.email || 'Unknown'
      }));
      
      setAttendance(attendanceWithUserDetails);
      
      const stats = attendanceWithUserDetails.reduce((acc, record) => {
        acc.total++;
        acc.present++;
        if (record.cleaning) acc.taskCompletion.cleaning++;
        if (record.sweeping) acc.taskCompletion.sweeping++;
        if (record.mopping) acc.taskCompletion.mopping++;
        return acc;
      }, {
        total: 0,
        present: 0,
        taskCompletion: { cleaning: 0, sweeping: 0, mopping: 0 }
      });
      
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceError(error.response?.data?.error || 'Failed to fetch attendance records');
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchAttendance();
  }, []);

  useEffect(() => {
    const filtered = complaints.filter(complaint => {
      const matchesSearch = searchTerm === '' || 
        complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.supervisorId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customerId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, statusFilter]);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/complaint/${complaintId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setError('Failed to update complaint status');
    }
  };

  // Calculate completion percentages
  const cleaningPercentage = attendanceStats.total ? Math.round((attendanceStats.taskCompletion.cleaning / attendanceStats.total) * 100) : 0;
  const sweepingPercentage = attendanceStats.total ? Math.round((attendanceStats.taskCompletion.sweeping / attendanceStats.total) * 100) : 0;
  const moppingPercentage = attendanceStats.total ? Math.round((attendanceStats.taskCompletion.mopping / attendanceStats.total) * 100) : 0;

  const handleExportAttendance = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      
      const response = await api.get('/attendance/export', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `attendance-${year}-${month.toString().padStart(2, '0')}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`Successfully exported attendance for ${selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      alert('Failed to export attendance records. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition"
            >
              <FiLogOut className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white p-6 pt-20">
          <div className="flex flex-col space-y-4">
            <div className="text-lg font-medium text-gray-900 mb-4">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Supervisors Card */}
          <div className="p-4 sm:p-5 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Supervisors</h3>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700">{attendanceStats.total}</p>
              </div>
            </div>
          </div>

          {/* Present Today Card */}
          <div className="p-4 sm:p-5 bg-white rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
                <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Present Today</h3>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700">{attendanceStats.present}</p>
              </div>
            </div>
          </div>

          {/* Open Complaints Card */}
          <div className="p-4 sm:p-5 bg-white rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-orange-100 text-orange-600">
                <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Open Complaints</h3>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700">
                  {complaints.filter(c => c.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          {/* Resolved Complaints Card */}
          <div className="p-4 sm:p-5 bg-white rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
                <FiCheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Resolved Complaints</h3>
                <p className="text-xl sm:text-2xl font-semibold text-gray-700">
                  {complaints.filter(c => c.status === 'RESOLVED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Completion Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <FiClipboard className="mr-2" /> Task Completion Status
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Cleaning Progress */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                  <FiHome className="mr-2 text-blue-500" /> Cleaning
                </h3>
                <span className="text-xs sm:text-sm font-medium text-blue-600">{cleaningPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div 
                  className="bg-blue-600 h-2 sm:h-2.5 rounded-full" 
                  style={{ width: `${cleaningPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Sweeping Progress */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                  <FiSun className="mr-2 text-green-500" /> Sweeping
                </h3>
                <span className="text-xs sm:text-sm font-medium text-green-600">{sweepingPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div 
                  className="bg-green-600 h-2 sm:h-2.5 rounded-full" 
                  style={{ width: `${sweepingPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Mopping Progress */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                  <FiCheckSquare className="mr-2 text-purple-500" /> Mopping
                </h3>
                <span className="text-xs sm:text-sm font-medium text-purple-600">{moppingPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div 
                  className="bg-purple-600 h-2 sm:h-2.5 rounded-full" 
                  style={{ width: `${moppingPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <FiCalendar className="mr-2" /> Today's Attendance
            </h2>
            <button 
              onClick={fetchAttendance}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium rounded hover:bg-blue-100 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {isAttendanceLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : attendanceError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-700">{attendanceError}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supervisor
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.length > 0 ? (
                      attendance.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {record.supervisorName.charAt(0)}
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {record.supervisorName}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                  {record.supervisorEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {record.cleaning && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs sm:text-xs font-medium bg-blue-100 text-blue-800">
                                  Cleaning
                                </span>
                              )}
                              {record.sweeping && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs sm:text-xs font-medium bg-green-100 text-green-800">
                                  Sweeping
                                </span>
                              )}
                              {record.mopping && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs sm:text-xs font-medium bg-purple-100 text-purple-800">
                                  Mopping
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500">
                          No attendance records found for today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Complaints Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <FiAlertCircle className="mr-2" /> Recent Complaints
            </h2>
            <button 
              onClick={fetchComplaints}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium rounded hover:bg-blue-100 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {/* Filters Section */}
          <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search complaints..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="sm:w-40">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </div>
              
              <ComplaintList 
                complaints={filteredComplaints}
                isAdmin={true}
                onUpdateStatus={handleUpdateStatus}
              />
            </>
          )}
        </div>

        {/* Export Attendance Button */}
        <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex items-center">
              <FiDownload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Export Attendance</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {/* Month Selection */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handlePreviousMonth}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
                >
                  ←
                </button>
                <span className="text-xs sm:text-sm font-medium min-w-[120px] sm:min-w-[150px] text-center">
                  {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
                >
                  →
                </button>
              </div>
              
              {/* Export Button */}
              <button
                onClick={handleExportAttendance}
                disabled={isExporting}
                className={`flex items-center justify-center sm:justify-start px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto
                  ${isExporting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FiDownload className="mr-2" /> 
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;