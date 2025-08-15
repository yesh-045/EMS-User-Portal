import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile, getRegisteredEvents, getOngoingEvents, getUpcomingEvents } from '../api';
import Button from '../components/Button';
import Input from '../components/Input';
import EventTimeline from '../components/EventTimeline';
import { showToast } from '../utils/toast';
import type { UserProfile, UpdateProfileRequest, RegisteredEvent, EventListItem } from '../types/user';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    department: '',
    email: '',
    phoneno: 0,
    yearofstudy: 1,
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileRequest, string>>>({});

  // Fetch profile data
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const response = await fetchProfile();
        setProfile(response.profile);
        
        // Initialize form data with profile data
        setFormData({
          name: response.profile.name,
          department: response.profile.department,
          email: response.profile.email,
          phoneno: Number(response.profile.phoneno),
          yearofstudy: response.profile.yearofstudy,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        showToast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const [regRes, ongoing, upcoming] = await Promise.all([
          getRegisteredEvents(),
          getOngoingEvents(),
          getUpcomingEvents(),
        ]);
        
        setRegisteredEvents(regRes.data);
        setAllEvents([...ongoing.data, ...upcoming.data]);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phoneno' || name === 'yearofstudy' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UpdateProfileRequest]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProfileRequest, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneno || formData.phoneno.toString().length < 10) {
      newErrors.phoneno = 'Valid phone number is required';
    }

    if (formData.yearofstudy < 1 || formData.yearofstudy > 4) {
      newErrors.yearofstudy = 'Year of study must be between 1 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile(formData);
      setProfile(response.profile);
      showToast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const departments = [
    'Computer Science and Engineering',
    'CSE (AI & ML)',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text">Your Profile</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-surface rounded-xl shadow-lg border border-border p-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text">{profile?.name}</h2>
                  <p className="text-text-secondary">{profile?.rollno}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-text-secondary text-sm">Department</p>
                  <p className="text-text font-medium">{profile?.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-secondary text-sm">Year of Study</p>
                  <p className="text-text font-medium">{profile?.yearofstudy}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-secondary text-sm">Email</p>
                  <p className="text-text font-medium">{profile?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-secondary text-sm">Phone Number</p>
                  <p className="text-text font-medium">{profile?.phoneno}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                  required
                />

                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={profile?.rollno || ''}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-input-bg border border-border rounded-lg text-text-secondary cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-1 text-xs text-text-secondary">Roll number cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-input-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 hover:border-text-secondary text-xs sm:text-base"
                    required
                  >
                    <option value="">Select your department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept} className="bg-input-bg text-text">
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500">{errors.department}</p>
                  )}
                </div>

                <Input
                  label="Year of Study"
                  name="yearofstudy"
                  type="number"
                  min="1"
                  max="4"
                  value={formData.yearofstudy || ''}
                  onChange={handleInputChange}
                  error={errors.yearofstudy}
                  placeholder="Year (1-4)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phoneno"
                  type="tel"
                  value={formData.phoneno || ''}
                  onChange={handleInputChange}
                  error={errors.phoneno}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  loading={saving}
                  className="px-6"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Event Timeline */}
        {eventsLoading ? (
          <div className="bg-surface rounded-xl shadow-lg border border-border p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading events timeline...</p>
          </div>
        ) : (
          <EventTimeline 
            registeredEvents={registeredEvents} 
            allEvents={allEvents}
          />
        )}

        {/* Security Section */}
        <div className="bg-surface rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-xl font-bold text-text mb-4">Security</h2>
          <p className="text-text-secondary mb-4">
            Want to change your password? You can reset it using the forgot password flow.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/forgot-password')}
          >
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;