import React, { useState } from 'react';
import '../styles/Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to Register
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!formData.username.trim()) {
      setMessage('Username is required');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      setMessage('Full name is required');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.email.trim()) {
      setMessage('Email is required');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.email.includes('@')) {
      setMessage('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setMessage('Password is required');
      setLoading(false);
      return;
    }

    const API_BASE = 'http://localhost:8000';
    
    try {
      if (isLogin) {
        // Login
        const response = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('username', formData.username);
          onLogin(formData.username);
        } else {
          // Handle different error formats
          let errorMessage = 'Login failed';
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail && Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => err.msg || err).join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          }
          setMessage(errorMessage);
        }
      } else {
        // Register
        const response = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });

        const data = await response.json();
        if (response.ok) {
          setMessage('Registration successful! Please login.');
          setIsLogin(true); // Switch to login tab
          setFormData({ username: '', name: '', email: '', password: '', role: 'User' });
        } else {
          // Handle different error formats
          let errorMessage = 'Registration failed';
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail && Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => err.msg || err).join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          }
          setMessage(errorMessage);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="tool-name">Job Analyzer</h1>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setMessage('');
              setFormData({ username: '', name: '', email: '', password: '', role: '' });
            }}
          >
            Register
          </button>
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setMessage('');
              setFormData({ username: '', name: '', email: '', password: '', role: '' });
            }}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="role"
                  placeholder="Job Role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                />
                  
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        {isLogin && (
          <div className="social-login">
            <div className="divider">
              <span>or continue with</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn google">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/google.svg"
                alt="Google"
                style={{ width: "20px", marginRight: "8px" }}
                /> Google
              </button>
              <button className="social-btn apple">
                <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg"
                alt="Apple"
                style={{ width: "20px", marginRight: "8px" }}
                /> Apple
              </button>
              <button className="social-btn linkedin">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg"
                alt="LinkedIn"
                style={{ width: "20px", marginRight: "8px" }}
                /> LinkedIn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;