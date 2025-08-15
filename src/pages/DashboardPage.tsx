import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { getRegisteredEvents, fetchMembershipDetails, fetchInvitations } from '../api';
import type { RegisteredEvent, MembershipDetails, InviteWithDetails } from '../types/user';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [memberships, setMemberships] = useState<MembershipDetails[]>([]);
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, membershipsRes, invitationsRes] = await Promise.all([
          getRegisteredEvents(),
          fetchMembershipDetails(),
          fetchInvitations()
        ]);
        
        setRegisteredEvents(eventsRes.data);
        setMemberships(membershipsRes.data);
        setInvitations(invitationsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Profile Section */}
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

        {/* Registered Events Section */}
        <div className="bg-surface rounded-xl shadow-xl p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-text">Your Registered Events</h2>
          {loading ? (
            <p className="text-text-secondary">Loading events...</p>
          ) : registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredEvents.map((registration) => (
                <div key={registration.team_id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-bold text-text">{registration.event.name}</h3>
                  <p className="text-text-secondary">Team: {registration.team_name || 'Individual'}</p>
                  <p className="text-text-secondary">Date: {new Date(registration.event.date!).toLocaleDateString()}</p>
                  <p className="text-text-secondary">Venue: {registration.event.venue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No registered events found.</p>
          )}
        </div>

        {/* Club Memberships Section */}
        <div className="bg-surface rounded-xl shadow-xl p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-text">Club Memberships</h2>
          {loading ? (
            <p className="text-text-secondary">Loading memberships...</p>
          ) : memberships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {memberships.map((membership) => (
                <div key={membership.id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-bold text-text">{membership.name}</h3>
                  <p className="text-text-secondary">Role: {membership.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No club memberships found.</p>
          )}
        </div>

        {/* Team Invitations Section */}
        <div className="bg-surface rounded-xl shadow-xl p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 text-text">Pending Team Invitations</h2>
          {loading ? (
            <p className="text-text-secondary">Loading invitations...</p>
          ) : invitations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((invite) => (
                <div key={invite.from_team_id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-bold text-text">{invite.event_name}</h3>
                  <p className="text-text-secondary">From: {invite.from_user_name}</p>
                  <p className="text-text-secondary">Team: {invite.teamName}</p>
                  <div className="mt-2 space-x-2">
                    <Button size="sm" onClick={() => {}}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => {}}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No pending invitations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
