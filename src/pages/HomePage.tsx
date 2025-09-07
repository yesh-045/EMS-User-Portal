import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineCheckCircle,
  AiOutlineBell,
  AiOutlineBarChart,
  AiOutlineSafety
} from 'react-icons/ai';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: AiOutlineCalendar,
      title: 'Event Management',
      description: 'Discover and register for technical and non-technical events happening in your college.',
      color: 'text-blue-500'
    },
    {
      icon: AiOutlineTeam,
      title: 'Team Collaboration',
      description: 'Form teams with your peers and collaborate on exciting projects and competitions.',
      color: 'text-green-500'
    },
    {
      icon: AiOutlineBell,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications about event updates and team invitations.',
      color: 'text-purple-500'
    },
    {
      icon: AiOutlineBarChart,
      title: 'Progress Tracking',
      description: 'Monitor your participation and achievements across various events and activities.',
      color: 'text-orange-500'
    },
    {
      icon: AiOutlineCheckCircle,
      title: 'Easy Registration',
      description: 'Simple and quick registration process for all events with just a few clicks.',
      color: 'text-emerald-500'
    },
    {
      icon: AiOutlineSafety,
      title: 'Secure Platform',
      description: 'Your data is safe with our secure authentication and privacy protection.',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
                <img
                  src="/psg.png"
                  alt="PSG Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-16 h-16 bg-surface rounded-xl p-2 border border-border shadow-lg">
                <img
                  src="/csea.png"
                  alt="CSEA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">Event Management</span>
              <br />
              <span className="text-text">System</span>
            </h1>

            <p className="text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your college event experience with our comprehensive platform.
              Discover events, form teams, and manage your academic journey seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <button
                onClick={() => navigate('/signup')}
                className="btn btn-primary btn-lg"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline btn-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">EMS</span>?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Our platform offers everything you need to make the most of your college experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card animate-scale-in hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-current/10 to-current/5 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="card-title text-center">{feature.title}</h3>
                  <p className="card-description text-center">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-surface/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">500+</div>
              <div className="text-text-secondary text-lg">Active Students</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">100+</div>
              <div className="text-text-secondary text-lg">Events Hosted</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">50+</div>
              <div className="text-text-secondary text-lg">Teams Formed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="card glass-effect animate-scale-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join hundreds of students who are already using EMS to enhance their college experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="btn btn-primary btn-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-secondary btn-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white rounded-lg p-1">
                <img
                  src="/psg.png"
                  alt="PSG Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-8 h-8 bg-surface rounded-lg p-1 border border-border">
                <img
                  src="/csea.png"
                  alt="CSEA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-lg font-bold gradient-text">EMS</span>
            </div>
            <div className="text-text-secondary text-sm">
              2024 Event Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
