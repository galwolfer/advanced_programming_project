import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPlaylist, updatePlaylist, deletePlaylist, removeVideoFromPlaylist } from '../api/client';
import './PlaylistPage.css';
import UpperLayout from '../components/upperLayout/UpperLayout';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';
import VideoThumbnail from '../components/videoThumbnail/VideoThumbnail';

export default function PlaylistPage({ signedInUser, token, isDarkMode, setDarkMode, setUser, setSearchQuery }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [id, token]);

  const loadPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPlaylist(id, token);
      setPlaylist(data.playlist);
      setEditName(data.playlist.name);
      setEditDescription(data.playlist.description || '');
      setEditIsPublic(data.playlist.isPublic);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await updatePlaylist(id, {
        name: editName,
        description: editDescription,
        isPublic: editIsPublic
      }, token);
      setPlaylist(data.playlist || data);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id, token);
        navigate('/playlists');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(id, videoId, token);
      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v.video.id !== videoId),
        videoCount: Math.max((prev.videoCount || 1) - 1, 0)
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

  const isOwner = signedInUser && playlist && playlist.owner.id === signedInUser.id;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2">
          <div className='appName'></div>
          <img src={icon} className='appIcon' alt='WeTube logo' />
          <LeftMenu isDarkMode={isDarkMode} />
        </div>
        <div className="col-10">
          <button type="button" className="btn btn-dark" id='darkModeButton' onClick={toggleMode}>Dark mode</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
          
          <div className="playlist-detail-container mt-4 px-3">
            {loading ? (
              <div className={isDarkMode ? 'text-white' : ''}>Loading playlist...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : !playlist ? (
              <div className="alert alert-warning">Playlist not found</div>
            ) : (
              <>
                <div className={`card mb-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
                  <div className="card-body">
                    {isEditing ? (
                      <form onSubmit={handleUpdate}>
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input 
                            type="text" 
                            className={`form-control ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea 
                            className={`form-control ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`}
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            rows="2"
                          />
                        </div>
                        <div className="form-check mb-3">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="editIsPublic"
                            checked={editIsPublic}
                            onChange={e => setEditIsPublic(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="editIsPublic">
                            Make public
                          </label>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary">Save Changes</button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h2 className="mb-1 text-danger">
                              {playlist.name}
                              <span className={`badge ms-3 fs-6 align-middle ${playlist.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                                {playlist.isPublic ? 'Public' : 'Private'}
                              </span>
                            </h2>
                            <p className="text-muted mb-2">By {playlist.owner.displayName}</p>
                            <p className="mb-3">{playlist.description}</p>
                            <div className="d-flex align-items-center text-muted small">
                              <i className="bi bi-film me-2"></i> {playlist.videoCount || playlist.videos?.length || 0} videos
                            </div>
                          </div>
                          
                          {isOwner && (
                            <div className="d-flex flex-column gap-2">
                              <div className="btn-group">
                                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(true)}>
                                  <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button className="btn btn-outline-danger" onClick={handleDelete}>
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </div>
                              <Link to="/" className="btn btn-outline-primary mt-2">
                                <i className="bi bi-plus-circle"></i> Add videos
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="playlist-videos">
                  <h4 className={`mb-4 ${isDarkMode ? 'text-white' : ''}`}>Videos</h4>
                  {(!playlist.videos || playlist.videos.length === 0) ? (
                    <div className={`text-center py-5 ${isDarkMode ? 'text-white' : ''}`}>
                      <i className="bi bi-camera-video display-1 text-muted mb-3 d-block"></i>
                      <h5>No videos in this playlist</h5>
                      {isOwner && <p className="text-muted">Browse videos and click 'Save' to add them here.</p>}
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {playlist.videos.map((item, index) => {
                        const video = item.video;
                        // Handle case where video was deleted but still in playlist
                        if (!video) return null;
                        
                        return (
                          <div key={video.id || index} className={`list-group-item d-flex align-items-center p-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''} playlist-video-item`}>
                            <div className="me-3 fw-bold text-muted">{index + 1}</div>
                            
                            <Link to={`/VideoPage/${video.id}`} className="flex-shrink-0 me-3">
                              <div style={{ width: '160px', height: '90px', overflow: 'hidden', borderRadius: '8px' }}>
                                <VideoThumbnail videoUrl={video.videoUrl} />
                              </div>
                            </Link>
                            
                            <div className="flex-grow-1 min-width-0">
                              <Link to={`/VideoPage/${video.id}`} className="text-decoration-none">
                                <h5 className={`mb-1 text-truncate ${isDarkMode ? 'text-white' : 'text-dark'}`}>{video.title}</h5>
                              </Link>
                              <div className="text-muted small text-truncate">{video.uploaderName}</div>
                              <div className="text-muted small mt-1">
                                Added {new Date(item.addedAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {isOwner && (
                              <button 
                                className="btn btn-link text-danger ms-3"
                                onClick={() => handleRemoveVideo(video.id)}
                                title="Remove from playlist"
                              >
                                <i className="bi bi-x-lg fs-5"></i>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
