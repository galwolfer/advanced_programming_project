import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVideoDetails, updateVideo } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';
import UpperLayout from '../components/upperLayout/UpperLayout';
import './VideoEditPage.css';

function VideoEditPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    
    let ignore = false;
    
    async function loadVideo() {
      setLoading(true);
      setError('');
      
      try {
        const { video } = await fetchVideoDetails(id, token);
        if (!ignore) {
          // Check ownership
          if (video.uploaderId !== signedInUser?.id && video.uploaderName !== signedInUser?.username) {
            setError("You do not have permission to edit this video.");
          } else {
            setFormData({
              title: video.title || '',
              description: video.description || '',
              category: video.category || '',
              thumbnailUrl: video.thumbnailUrl || ''
            });
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load video details');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    
    if (signedInUser) {
      loadVideo();
    }
    
    return () => {
      ignore = true;
    };
  }, [id, token, signedInUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateVideo(id, formData, token);
      setSuccess('Video updated successfully!');
      setTimeout(() => {
        navigate(`/VideoPage/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update video');
    } finally {
      setSaving(false);
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
          
          <div className={`video-edit-container mt-4 p-4 ${isDarkMode ? 'dark text-bg-dark' : 'bg-light'}`}>
            <h2>Edit Video</h2>
            <hr className={isDarkMode ? "border-secondary" : ""} />
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            {loading ? (
              <div>Loading video details...</div>
            ) : !error || error.includes("Failed") ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
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
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="thumbnailUrl" className="form-label">Thumbnail URL</label>
                  <input
                    type="url"
                    className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                  />
                  <div className="form-text">Leave blank to use auto-generated thumbnail or enter an image URL.</div>
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => navigate(`/VideoPage/${id}`)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoEditPage;