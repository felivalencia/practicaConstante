import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="dashboard-main">
        <div className="content">
          <div className="demo-box">
            <h2 className="text-2xl font-bold mb-4">Protected Content</h2>
            <p>This content is only visible to authenticated users.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;