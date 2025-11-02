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
  AiOutlineBank,
  AiOutlineIdcard,
  AiOutlineCalendar,
  AiOutlineCheckCircle
} from 'react-icons/ai';

type IconComponent = React.ComponentType<{ className?: string }>;

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

  const overviewCards: Array<{ label: string; value: string; description: string; icon: IconComponent }> = [
    {
      label: 'Roll Number',
      value: profile.rollno,
      description: 'Displayed on every registration you submit.',
      icon: AiOutlineIdcard
    },
    {
      label: 'Year of Study',
      value: `${profile.yearofstudy} Year`,
      description: 'Helps EMS surface cohort-specific opportunities.',
      icon: AiOutlineCalendar
    },
    {
      label: 'Department',
      value: profile.department,
      description: 'Informs clubs which audience to reach out to.',
      icon: AiOutlineBank
    }
  ];

  const contactDetails: Array<{ label: string; value: string; icon: IconComponent }> = [
    {
      label: 'Email Address',
      value: profile.email,
      icon: AiOutlineMail
    },
    {
      label: 'Phone Number',
      value: profile.phoneno.toString(),
      icon: AiOutlinePhone
    }
  ];

  

  return (
    <div className="min-h-screen bg-background text-text">
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent)]"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-10 items-center">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl border border-border/70 bg-background/70 flex items-center justify-center shadow-xl">
                  <AiOutlineUser className="w-12 h-12 text-text-secondary" />
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full border border-border bg-background px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-text-secondary">
                  EMS
                </div>
              </div>
              <div className="space-y-4">
                <span className="inline-flex text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
                  Profile Command Center
                </span>
                <h1 className="text-3xl lg:text-5xl font-semibold leading-tight">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <AiOutlineIdcard className="w-4 h-4" />
                    {profile.rollno}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <AiOutlineBank className="w-4 h-4" />
                    {profile.department}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <AiOutlineCheckCircle className="w-4 h-4" />
                    {profile.yearofstudy} Year
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-text transition-colors duration-200 hover:bg-background"
                >
                  <AiOutlineEdit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-text px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-background transition-colors duration-200 hover:bg-background hover:text-text disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <div className="loading-spinner mr-2 h-4 w-4 border-2"></div>
                        Saving
                      </>
                    ) : (
                      <>
                        <AiOutlineCheck className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-text-secondary transition-colors duration-200 hover:bg-background hover:text-text"
                  >
                    <AiOutlineClose className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-10">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-surface/80 p-8 shadow-2xl">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-border/70">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">Personal Details</span>
                  <h2 className="mt-2 text-2xl font-semibold">Profile Overview</h2>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
                  {isEditing ? 'Editing' : 'Viewing'}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label flex items-center text-sm font-semibold">
                        <AiOutlineUser className="mr-2 h-5 w-5 text-text-secondary" />
                        Full Name
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input text-text focus:shadow-lg"
                        placeholder="Enter your full name"
                      />
                      {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center text-sm font-semibold">
                        <AiOutlineMail className="mr-2 h-5 w-5 text-text-secondary" />
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input text-text focus:shadow-lg"
                        placeholder="Enter your email"
                      />
                      {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center text-sm font-semibold">
                        <AiOutlinePhone className="mr-2 h-5 w-5 text-text-secondary" />
                        Phone Number
                      </label>
                      <input
                        name="phoneno"
                        type="tel"
                        value={formData.phoneno || ''}
                        onChange={handleInputChange}
                        className="form-input text-text focus:shadow-lg"
                        placeholder="Enter phone number"
                      />
                      {errors.phoneno && <div className="form-error">{errors.phoneno}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center text-sm font-semibold">
                        <AiOutlineBank className="mr-2 h-5 w-5 text-text-secondary" />
                        Year of Study
                      </label>
                      <select
                        name="yearofstudy"
                        value={formData.yearofstudy}
                        onChange={handleInputChange}
                        className="form-input text-text focus:shadow-lg"
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
                    <label className="form-label flex items-center text-sm font-semibold">
                      <AiOutlineBank className="mr-2 h-5 w-5 text-text-secondary" />
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-input text-text focus:shadow-lg"
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && <div className="form-error">{errors.department}</div>}
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contactDetails.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border/70 bg-background/60 p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-text-secondary"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface/80">
                            <item.icon className="h-6 w-6 text-text-secondary" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
                              {item.label}
                            </span>
                            <p className="text-base font-medium break-all">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Department</span>
                    <p className="mt-2 text-lg font-semibold">{profile.department}</p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Keep your department accurate so EMS can surface the most relevant events and collaborative opportunities.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-surface/70 p-6 space-y-5">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">Snapshot</span>
              {overviewCards.map((card) => (
                <div key={card.label} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/80">
                    <card.icon className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">{card.label}</p>
                    <p className="text-base font-semibold">{card.value}</p>
                    <p className="text-xs text-text-secondary">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>

            
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;