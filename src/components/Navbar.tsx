import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AiOutlineHome, AiOutlineMail, AiOutlineLogout } from 'react-icons/ai';
import { BsSun, BsMoon } from 'react-icons/bs';
import { fetchInvitations } from '../api';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [invitationCount, setInvitationCount] = useState(0);

  // Fetch invitations count when user is authenticated
  useEffect(() => {
    const fetchInvitationsCount = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const response = await fetchInvitations();
          setInvitationCount(response.data?.length || 0);
        } catch (error) {
          console.error('Error fetching invitations:', error);
          setInvitationCount(0);
        }
      } else {
        setInvitationCount(0);
      }
    };

    fetchInvitationsCount();
    
    // Refresh invitations count every 30 seconds
    let interval: number | null = null;
    if (isAuthenticated && !isLoading) {
      interval = setInterval(fetchInvitationsCount, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInboxNavigation = () => {
    navigate('/inbox');
    // Refresh invitation count when navigating to inbox
    if (isAuthenticated && !isLoading) {
      fetchInvitations()
        .then(response => setInvitationCount(response.data?.length || 0))
        .catch(error => console.error('Error refreshing invitations:', error));
    }
  };

  // Don't show navbar on login/signup pages
  const hideNavbar = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
  
  if (hideNavbar) {
    return null;
  }

  // Show a skeleton/placeholder while authentication is loading
  if (isLoading) {
    return (
      <nav className="bg-surface border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-surface/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Left side - Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* PSG Logo */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white rounded-md p-1 flex items-center justify-center">
                  <img 
                    src="/psg.png" 
                    alt="PSG Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {/* CSEA Logo */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-surface rounded-md p-1 border border-border flex items-center justify-center">
                  <img 
                    src="/csea.png" 
                    alt="CSEA Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* EMS Title */}
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent">
                  EMS
                </div>
                
              </div>
            </div>

            {/* Right side - Loading placeholder */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Skeleton placeholders for navigation buttons */}
              <div className="flex items-center space-x-1 sm:space-x-4">
                <div className="w-10 h-10 sm:w-24 sm:h-10 bg-button-bg border border-border rounded-md animate-pulse"></div>
                <div className="w-10 h-10 sm:w-20 sm:h-10 bg-button-bg border border-border rounded-md animate-pulse"></div>
                <div className="w-10 h-10 sm:w-20 sm:h-10 bg-button-bg border border-border rounded-md animate-pulse"></div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-md bg-button-bg border border-border hover:bg-button-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <BsSun className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                ) : (
                  <BsMoon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-surface/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* PSG Logo */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white rounded-md p-1 flex items-center justify-center">
                <img 
                  src="/psg.png" 
                  alt="PSG Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              
              {/* CSEA Logo */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-surface rounded-md p-1 border border-border flex items-center justify-center">
                <img 
                  src="/csea.png" 
                  alt="CSEA Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              
              {/* EMS Title */}
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent">
                EMS
              </div>
              
            </div>
          </div>

          {/* Right side - Navigation and Theme Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {isAuthenticated && user && (
              <>
                {/* Navigation Links - Icon only on mobile, text+icon on desktop */}
                <div className="flex items-center space-x-1 sm:space-x-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      location.pathname === '/dashboard' 
                        ? 'bg-accent text-primary' 
                        : 'text-text-secondary hover:text-text hover:bg-button-hover'
                    }`}
                    title="Dashboard"
                  >
                    <AiOutlineHome className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  <button
                    onClick={handleInboxNavigation}
                    className={`px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 relative ${
                      location.pathname === '/inbox' 
                        ? 'bg-accent text-primary' 
                        : 'text-text-secondary hover:text-text hover:bg-button-hover'
                    }`}
                    title="Inbox"
                  >
                    <div className="relative">
                      <AiOutlineMail className="w-5 h-5" />
                      {invitationCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg animate-pulse border border-red-400">
                          {invitationCount > 9 ? '9+' : invitationCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline">Inbox</span>
                  </button>
                </div>

                {/* Logout Button - Text on desktop, icon on mobile */}
                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text hover:bg-button-hover transition-colors duration-200 flex items-center space-x-2"
                  title="Logout"
                >
                  <AiOutlineLogout className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            {!isAuthenticated && location.pathname === '/' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-primary hover:bg-accent-hover transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-md bg-button-bg border border-border hover:bg-button-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <BsSun className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              ) : (
                <BsMoon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
