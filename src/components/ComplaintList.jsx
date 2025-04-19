import React from 'react';

const ComplaintList = ({ complaints = [], isAdmin = false, onUpdateStatus }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Complaints</h2>
      {complaints.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No complaints found.</div>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint._id} className="bg-white shadow rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{complaint.subject}</h3>
                <p className="mt-1 text-sm text-gray-500">{complaint.description}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <p>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  {complaint.resolvedAt && (
                    <p>Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                  )}
                  <p>Customer: {complaint.customerId?.email || 'N/A'}</p>
                  <p>Supervisor: {complaint.supervisorId?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {complaint.status}
                </span>
                {isAdmin && complaint.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onUpdateStatus(complaint._id, 'RESOLVED')}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ComplaintList;