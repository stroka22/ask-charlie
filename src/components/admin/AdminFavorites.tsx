import React from 'react';

const AdminFavorites: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Favorites</h2>
      
      <div className="p-8 text-center border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-600">
          This feature will allow administrators to view and manage user favorite assistants.
          You'll be able to see which assistants are most popular and adjust recommendations accordingly.
        </p>
      </div>
    </div>
  );
};

export default AdminFavorites;
