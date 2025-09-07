import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile, getRegisteredEvents, getOngoingEvents, getUpcomingEvents } from '../api';
import Button from '../components/Button';
import Input from '../components/Input';
import EventTimeline from '../components/EventTimeline';
import { showToast } from '../utils/toast';
import type { UserProfile, UpdateProfileRequest, RegisteredEvent, EventListItem } from '../types/user';
import {
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineIdcard,
  AiOutlineBank,
  AiOutlineTrophy,
  AiOutlineCalendar,
  AiOutlineTeam
} from 'react-icons/ai';

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

  // Fetch profile data
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const response = await fetchProfile();

        // Handle the correct API response structure: { message, profile }
        const profileData = response.profile || response;
        setProfile(profileData);

        // Initialize form data with profile data
        setFormData({
          name: profileData.name,
          department: profileData.department,
          email: profileData.email,
          phoneno: Number(profileData.phoneno),
          yearofstudy: profileData.yearofstudy,
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
    const fetchEventsData = async () => {
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
        console.error('Error fetching events data:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProfileRequest, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);

      // Update profile state with new data
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          phoneno: formData.phoneno.toString()
        });
      }

      setIsEditing(false);
      showToast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        department: profile.department,
        email: profile.email,
        phoneno: Number(profile.phoneno),
        yearofstudy: profile.yearofstudy,
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Failed to load profile</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-transparent rounded-2xl"></div>
          <div className="relative card glass-effect">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4 animate-slide-up">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <AiOutlineUser className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    <span className="gradient-text">{profile.name}</span>
                  </h1>
                  <p className="text-text-secondary">{profile.department}</p>
                  <p className="text-text-muted text-sm">Roll No: {profile.rollno}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 animate-scale-in">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline"
                  >
                    <AiOutlineEdit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <AiOutlineCheck className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-secondary"
                    >
                      <AiOutlineClose className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details Card */}
            <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
                <p className="card-description">Your basic profile details</p>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">
                      <AiOutlineUser className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter your full name"
                      />
                      <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <AiOutlineMail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter your email"
                      />
                      <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">
                        <AiOutlinePhone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          name="phoneno"
                          type="tel"
                          value={formData.phoneno || ''}
                          onChange={handleInputChange}
                          className="form-input pl-10"
                          placeholder="Enter phone number"
                        />
                        <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      </div>
                      {errors.phoneno && <div className="form-error">{errors.phoneno}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <AiOutlineBank className="w-4 h-4 inline mr-2" />
                        Year of Study
                      </label>
                      <select
                        name="yearofstudy"
                        value={formData.yearofstudy}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>
                      {errors.yearofstudy && <div className="form-error">{errors.yearofstudy}</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <div className="form-error">{errors.department}</div>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-surface-hover rounded-lg">
                    <AiOutlineMail className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-surface-hover rounded-lg">
                    <AiOutlinePhone className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Phone</p>
                      <p className="font-medium">{profile.phoneno}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-surface-hover rounded-lg">
                    <AiOutlineBank className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Year of Study</p>
                      <p className="font-medium">{profile.yearofstudy} Year</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="card-header">
                <h3 className="card-title">Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <AiOutlineTrophy className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Events Joined</p>
                      <p className="text-xl font-bold">{registeredEvents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <AiOutlineCalendar className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Available Events</p>
                      <p className="text-xl font-bold">{allEvents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <AiOutlineTeam className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Active Teams</p>
                      <p className="text-xl font-bold">
                        {registeredEvents.filter(event => event.team_id).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline w-full justify-start"
                >
                  <AiOutlineCalendar className="w-4 h-4" />
                  Browse Events
                </button>
                <button
                  onClick={() => navigate('/inbox')}
                  className="btn btn-outline w-full justify-start"
                >
                  <AiOutlineTeam className="w-4 h-4" />
                  Check Invitations
                </button>
                <button
                  onClick={() => navigate('/timeline')}
                  className="btn btn-outline w-full justify-start"
                >
                  <AiOutlineTrophy className="w-4 h-4" />
                  View Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;