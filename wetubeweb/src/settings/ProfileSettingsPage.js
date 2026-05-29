import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';
import UpperLayout from '../components/upperLayout/UpperLayout';
import './ProfileSettingsPage.css';

function ProfileSettingsPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    profilePictureUrl: '',
    bannerUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    
    if (signedInUser) {
      setFormData({
        displayName: signedInUser.displayName || '',
        description: signedInUser.description || '',
        profilePictureUrl: signedInUser.profilePictureUrl || '',
        bannerUrl: signedInUser.bannerUrl || ''
      });
    }
  }, [signedInUser, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData, token);
      setSuccess('Profile updated successfully!');
      if (setUser && result.user) {
        // Update user state if the API returns updated user object
        setUser(result.user);
      }
      setTimeout(() => {
        navigate(`/channel/${signedInUser.id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!signedInUser) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2">
          <img src={icon} className='appIcon' alt='WeTube logo' />
          <LeftMenu isDarkMode={isDarkMode} />
        </div>
        <div className="col-10">
          <button type="button" className="btn btn-dark" id='darkModeButton' onClick={toggleMode}>Dark mode</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
          
          <div className={`settings-container mt-4 p-4 ${isDarkMode ? 'dark text-bg-dark' : 'bg-light'}`}>
            <h2>Channel Settings</h2>
            <hr className={isDarkMode ? "border-secondary" : ""} />
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="displayName" className="form-label">Display Name</label>
                <input
                  type="text"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label htmlFor="profilePictureUrl" className="form-label">Profile Picture URL</label>
                <input
                  type="url"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  id="profilePictureUrl"
                  name="profilePictureUrl"
                  value={formData.profilePictureUrl}
                  onChange={handleChange}
                />
                <div className="form-text">Link to an image for your avatar.</div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="bannerUrl" className="form-label">Banner URL</label>
                <input
                  type="url"
                  className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  id="bannerUrl"
                  name="bannerUrl"
                  value={formData.bannerUrl}
                  onChange={handleChange}
                />
                <div className="form-text">Link to a wide image for your channel header.</div>
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate(`/channel/${signedInUser.id}`)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;