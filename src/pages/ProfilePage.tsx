import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../api';
import { showToast } from '../utils/toast';
import type { UserProfile, UpdateProfileRequest } from '../types/user';
import {
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineBank
} from 'react-icons/ai';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Required<UpdateProfileRequest>>({
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
        const profileData: any = response.profile || response;
        
        // Convert phoneno to number if it's a string and ensure all required fields exist
        const userProfile: UserProfile = {
          id: profileData.id || 0,
          name: profileData.name,
          rollno: profileData.rollno,
          department: profileData.department,
          email: profileData.email,
          phoneno: typeof profileData.phoneno === 'string' ? parseInt(profileData.phoneno) : profileData.phoneno,
          yearofstudy: profileData.yearofstudy,
        };
        
        setProfile(userProfile);

        // Initialize form data with profile data
        setFormData({
          name: userProfile.name,
          department: userProfile.department,
          email: userProfile.email,
          phoneno: userProfile.phoneno,
          yearofstudy: userProfile.yearofstudy,
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProfileRequest, string>> = {};

    if (!formData.name?.trim()) {
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

    if (!formData.phoneno || formData.phoneno.toString().length !== 10) {
      newErrors.phoneno = 'Phone number must be 10 digits';
    }

    if (typeof formData.yearofstudy !== 'number' || formData.yearofstudy < 1 || formData.yearofstudy > 4) {
      newErrors.yearofstudy = 'Year of study must be between 1 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phoneno' || name === 'yearofstudy' ? 
        (value === '' ? prev[name as keyof UpdateProfileRequest] : Number(value)) : 
        value
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
          name: formData.name || profile.name,
          department: formData.department || profile.department,
          email: formData.email || profile.email,
          phoneno: formData.phoneno || profile.phoneno,
          yearofstudy: formData.yearofstudy || profile.yearofstudy
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background */}
          <div className="absolute inset-0 bg-surface/50 rounded-2xl"></div>
          
          <div className="relative bg-surface/80 backdrop-blur-sm border border-border rounded-2xl p-6 lg:p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Profile Avatar and Info */}
              <div className="flex items-center space-x-4 lg:space-x-6 animate-slide-up">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-border rounded-full flex items-center justify-center shadow-lg">
                    <AiOutlineUser className="w-10 h-10 lg:w-12 lg:h-12 text-text-secondary" />
                  </div>
                </div>
                
                {/* User Details */}
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold mb-2 text-text">
                    {profile.name}
                  </h1>
                  <div className="space-y-1">
                    <p className="text-text-secondary font-medium text-sm lg:text-base flex items-center">
                      <span className="inline-block w-2 h-2 bg-text-secondary rounded-full mr-2"></span>
                      {profile.department}
                    </p>
                    <p className="text-text-secondary text-xs lg:text-sm flex items-center">
                      <span className="inline-block w-2 h-2 bg-text-secondary rounded-full mr-2"></span>
                      Roll No: {profile.rollno}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3 animate-scale-in w-full lg:w-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline w-full lg:w-auto transition-all duration-300"
                  >
                    <AiOutlineEdit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2 w-full lg:w-auto">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn btn-primary flex-1 lg:flex-initial shadow-lg"
                    >
                      {saving ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <AiOutlineCheck className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-secondary flex-1 lg:flex-initial"
                    >
                      <AiOutlineClose className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="relative">
          
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            {/* Top Border */}
            <div className="h-1 bg-border"></div>
            
            <div className="p-6 lg:p-8">
              {/* Card Header */}
              <div className="mb-6 pb-4 border-b border-border/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-1 h-6 bg-text-secondary rounded-full"></div>
                  <h2 className="text-2xl font-bold text-text">Personal Information</h2>
                </div>
                <p className="text-text-secondary text-sm ml-3">Manage your personal details and contact information</p>
              </div>

            {isEditing ? (
              <div className="space-y-6">
                {/* Full Name Input */}
                <div className="form-group">
                  <label className="form-label flex items-center text-base">
                    <AiOutlineUser className="w-5 h-5 inline mr-2 text-text-secondary" />
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input pl-12 transition-all duration-200 focus:shadow-lg"
                      placeholder="Enter your full name"
                    />
                    <AiOutlineUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary transition-colors" />
                  </div>
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                {/* Email Input */}
                <div className="form-group">
                  <label className="form-label flex items-center text-base">
                    <AiOutlineMail className="w-5 h-5 inline mr-2 text-text-secondary" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input pl-12 transition-all duration-200 focus:shadow-lg"
                      placeholder="Enter your email"
                    />
                    <AiOutlineMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary transition-colors" />
                  </div>
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                {/* Phone and Year Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label flex items-center text-base">
                      <AiOutlinePhone className="w-5 h-5 inline mr-2 text-text-secondary" />
                      Phone Number
                    </label>
                    <div className="relative group">
                      <input
                        name="phoneno"
                        type="tel"
                        value={formData.phoneno || ''}
                        onChange={handleInputChange}
                        className="form-input pl-12 transition-all duration-200 focus:shadow-lg"
                        placeholder="Enter phone number"
                      />
                      <AiOutlinePhone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary transition-colors" />
                    </div>
                    {errors.phoneno && <div className="form-error">{errors.phoneno}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label flex items-center text-base">
                      <AiOutlineBank className="w-5 h-5 inline mr-2 text-text-secondary" />
                      Year of Study
                    </label>
                    <select
                      name="yearofstudy"
                      value={formData.yearofstudy}
                      onChange={handleInputChange}
                      className="form-input transition-all duration-200 focus:shadow-lg"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                    {errors.yearofstudy && <div className="form-error">{errors.yearofstudy}</div>}
                  </div>
                </div>

                {/* Department Select */}
                <div className="form-group">
                  <label className="form-label flex items-center text-base">
                    <AiOutlineBank className="w-5 h-5 inline mr-2 text-text-secondary" />
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-input transition-all duration-200 focus:shadow-lg"
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
                {/* Email Display */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:shadow-lg hover:border-text-secondary">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center">
                        <AiOutlineMail className="w-6 h-6 text-text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-base font-semibold text-text truncate">{profile.email}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Display */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:shadow-lg hover:border-text-secondary">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center">
                        <AiOutlinePhone className="w-6 h-6 text-text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-base font-semibold text-text">{profile.phoneno}</p>
                    </div>
                  </div>
                </div>

                {/* Year of Study Display */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:shadow-lg hover:border-text-secondary">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center">
                        <AiOutlineBank className="w-6 h-6 text-text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">Year of Study</p>
                      <p className="text-base font-semibold text-text">{profile.yearofstudy} Year</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;