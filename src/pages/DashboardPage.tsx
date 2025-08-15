import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-xl shadow-xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>

          {user && (
            <div className="space-y-4">
              <h2 className="text-xl text-text">Welcome, {user.name}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
                <div>
                  <p><strong>Roll Number:</strong> {user.rollno}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phoneno}</p>
                </div>
                <div>
                  <p><strong>Department:</strong> {user.department}</p>
                  <p><strong>Year of Study:</strong> {user.yearofstudy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
