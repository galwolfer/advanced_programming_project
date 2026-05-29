import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMyPlaylists, createPlaylist } from '../api/client';
import './MyPlaylistsPage.css';
import UpperLayout from '../components/upperLayout/UpperLayout';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';

export default function MyPlaylistsPage({ signedInUser, token, isDarkMode, setDarkMode, setUser, setSearchQuery }) {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    loadPlaylists();
  }, [token, navigate]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await fetchMyPlaylists(token);
      setPlaylists(data.playlists || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const data = await createPlaylist({
        name: newName,
        description: newDescription,
        isPublic: newIsPublic
      }, token);
      setPlaylists([...playlists, data.playlist || data]);
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      setNewIsPublic(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

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
          
          <div className="playlists-container mt-4 px-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className={isDarkMode ? 'text-white' : ''}>My Playlists</h2>
              <button className="btn btn-danger" onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? 'Cancel' : 'Create Playlist'}
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showCreate && (
              <div className={`card mb-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
                <div className="card-body">
                  <h5 className="card-title">Create a new playlist</h5>
                  <form onSubmit={handleCreate}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        className={`form-control ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`}
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                        placeholder="Playlist name"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        className={`form-control ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`}
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Optional description"
                        rows="2"
                      />
                    </div>
                    <div className="form-check mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isPublic"
                        checked={newIsPublic}
                        onChange={e => setNewIsPublic(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isPublic">
                        Make public
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={creating || !newName.trim()}>
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div className={isDarkMode ? 'text-white' : ''}>Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className={`text-center py-5 ${isDarkMode ? 'text-white' : ''}`}>
                <i className="bi bi-collection-play display-1 text-muted mb-3 d-block"></i>
                <h4>No playlists yet</h4>
                <p className="text-muted">Create your first one to start saving videos!</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {playlists.map(playlist => (
                  <div className="col" key={playlist.id}>
                    <Link to={`/playlist/${playlist.id}`} className="text-decoration-none">
                      <div className={`card h-100 playlist-card ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title text-truncate mb-0 text-danger">{playlist.name}</h5>
                            <span className={`badge ${playlist.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                              {playlist.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                          <p className="card-text small text-truncate text-muted mb-3">
                            {playlist.description || 'No description'}
                          </p>
                          <div className="d-flex align-items-center mt-auto">
                            <i className="bi bi-film me-2"></i>
                            <small>{playlist.videoCount || 0} videos</small>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
