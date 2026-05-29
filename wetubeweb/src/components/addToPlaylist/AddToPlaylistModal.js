import React, { useState, useEffect } from 'react';
import { fetchMyPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from '../../api/client';
import './AddToPlaylistModal.css';

export default function AddToPlaylistModal({ show, onHide, videoId, token }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());

  useEffect(() => {
    if (show && token) {
      loadPlaylists();
      setAddedPlaylists(new Set());
    }
  }, [show, token]);

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
    if (!newPlaylistName.trim()) return;
    
    setLoading(true);
    try {
      const data = await createPlaylist({
        name: newPlaylistName,
        isPublic: newPlaylistIsPublic,
        description: ''
      }, token);
      
      const newPlaylist = data.playlist || data;
      setPlaylists([...playlists, newPlaylist]);
      setShowCreate(false);
      setNewPlaylistName('');
      setNewPlaylistIsPublic(false);
      
      await handleTogglePlaylist(newPlaylist.id, true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlaylist = async (playlistId, isChecked) => {
    try {
      if (isChecked) {
        await addVideoToPlaylist(playlistId, videoId, token);
        const nextAdded = new Set(addedPlaylists);
        nextAdded.add(playlistId);
        setAddedPlaylists(nextAdded);
      } else {
        await removeVideoFromPlaylist(playlistId, videoId, token);
        const nextAdded = new Set(addedPlaylists);
        nextAdded.delete(playlistId);
        setAddedPlaylists(nextAdded);
      }
    } catch (err) {
      setError(err.message);
      const nextAdded = new Set(addedPlaylists);
      if (isChecked) {
        nextAdded.delete(playlistId);
      } else {
        nextAdded.add(playlistId);
      }
      setAddedPlaylists(nextAdded);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-content shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title h6 fw-bold">Save to playlist</h5>
            <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-1 px-2 small">{error}</div>}
            
            {loading && playlists.length === 0 ? (
              <div className="text-center my-3 small text-muted">Loading playlists...</div>
            ) : (
              <div className="mb-3 playlist-list">
                {playlists.length === 0 ? (
                  <div className="text-muted text-center small py-2">No playlists yet.</div>
                ) : (
                  playlists.map(playlist => (
                    <div key={playlist.id} className="form-check py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`playlist-${playlist.id}`}
                        checked={addedPlaylists.has(playlist.id)}
                        onChange={(e) => handleTogglePlaylist(playlist.id, e.target.checked)}
                      />
                      <label className="form-check-label w-100 d-flex justify-content-between text-truncate" htmlFor={`playlist-${playlist.id}`}>
                        <span className="text-truncate">{playlist.name}</span>
                        {!playlist.isPublic && <i className="bi bi-lock-fill text-muted ms-2 mt-1" style={{ fontSize: '0.75rem' }}></i>}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}

            {!showCreate ? (
              <button 
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-dark"
                onClick={() => setShowCreate(true)}
              >
                <i className="bi bi-plus-lg me-2 fs-5"></i> Create new playlist
              </button>
            ) : (
              <form onSubmit={handleCreate} className="mt-3">
                <div className="mb-2">
                  <label className="form-label small mb-1">Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm border-top-0 border-start-0 border-end-0 rounded-0 shadow-none px-0"
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    required
                    placeholder="Enter playlist name..."
                    autoFocus
                  />
                </div>
                <div className="form-check mb-3 mt-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="publicCheck"
                    checked={newPlaylistIsPublic}
                    onChange={e => setNewPlaylistIsPublic(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="publicCheck">
                    Public
                  </label>
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-sm btn-link text-decoration-none fw-bold" disabled={!newPlaylistName.trim() || loading}>CREATE</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
