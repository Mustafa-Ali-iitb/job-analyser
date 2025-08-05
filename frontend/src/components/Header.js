import React, { useState, useRef, useEffect } from 'react';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef(null);

  // Fetch user details from backend
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserDetails(userData);
        } else {
          console.error('Failed to fetch user details');
          // Fallback to username only if API fails
          setUserDetails({
            name: user,
            email: 'N/A',
            role: 'User'
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Fallback to username only if API fails
        setUserDetails({
          name: user,
          email: 'N/A',
          role: 'User'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="tool-name">Job Analyzer</h1>
      </div>

      <div className="header-right" ref={profileRef}>
        <div className="profile-container">
          <button className="profile-button" onClick={toggleProfileMenu}>
            <div className="profile-icon">
              <span>
                {userDetails?.name 
                  ? userDetails.name.charAt(0).toUpperCase() 
                  : user.charAt(0).toUpperCase()
                }
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              {loading ? (
                <div className="profile-loading">
                  <div className="loading-spinner-small"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <div className="profile-info">
                    <div className="profile-detail">
                      <span className="label">Name:</span>
                      <span className="value">{userDetails?.name || user}</span>
                    </div>
                    <div className="profile-detail">
                      <span className="label">Email:</span>
                      <span className="value">{userDetails?.email || 'N/A'}</span>
                    </div>
                    <div className="profile-detail">
                      <span className="label">Role:</span>
                      <span className="value">{userDetails?.role || 'User'}</span>
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    <button className="menu-item settings-btn">
                      Settings
                    </button>
                    <button className="menu-item logout-btn" onClick={onLogout}>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;