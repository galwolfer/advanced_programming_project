import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchHistory, clearHistory, removeHistoryEntry } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import UpperLayout from '../components/upperLayout/UpperLayout';
import icon from '../logo.svg';
import './HistoryPage.css';

function HistoryPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!signedInUser || !token) {
      navigate('/signin');
    }
  }, [signedInUser, token, navigate]);

  const loadHistory = useCallback(async (page) => {
    if (!token) return;
    setLoading(true);
    setPageError('');
    try {
      const data = await fetchHistory(page, 20, token);
      setHistoryEntries(data.entries);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory(currentPage);
  }, [loadHistory, currentPage]);

  const toggleMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire watch history?")) return;
    try {
      await clearHistory(token);
      setHistoryEntries([]);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemoveEntry = async (videoId) => {
    try {
      await removeHistoryEntry(videoId, token);
      setHistoryEntries((prev) => prev.filter(entry => entry.video.id !== videoId));
    } catch (error) {
      alert(error.message);
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

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
          
          <div className="history-container mt-4 px-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className={isDarkMode ? "text-light" : "text-dark"}>Watch history</h2>
              {historyEntries.length > 0 && (
                <button className="btn btn-outline-danger" onClick={handleClearHistory}>
                  Clear all history
                </button>
              )}
            </div>

            {pageError ? <div className="alert alert-danger">{pageError}</div> : null}
            
            {loading ? (
              <div className="mt-4">Loading history...</div>
            ) : historyEntries.length === 0 ? (
              <div className="mt-4">No watch history yet. Start watching videos!</div>
            ) : (
              <div className="history-list">
                {historyEntries.map((entry) => (
                  <div key={entry.video.id} className={`history-item d-flex mb-3 p-2 rounded ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
                    <Link to={`/VideoPage/${entry.video.id}`}>
                      <img src={entry.video.thumbnailUrl} className="history-thumbnail rounded" alt={entry.video.title} style={{ width: '160px', height: '90px', objectFit: 'cover' }} />
                    </Link>
                    <div className="ms-3 flex-grow-1">
                      <Link to={`/VideoPage/${entry.video.id}`} className={`text-decoration-none ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                        <h5>{entry.video.title}</h5>
                      </Link>
                      <div className="text-muted small">{entry.video.uploaderName}</div>
                      <div className="text-muted small">Watched {timeAgo(entry.watchedAt)}</div>
                    </div>
                    <button className="btn btn-light align-self-start" onClick={() => handleRemoveEntry(entry.video.id)} aria-label="Remove from watch history">
                      <i className="bi bi-x-lg"></i> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <button 
                  className="btn btn-outline-primary me-2" 
                  disabled={currentPage <= 1} 
                  onClick={() => setCurrentPage(c => c - 1)}
                >
                  Previous
                </button>
                <span className={`align-self-center mx-3 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="btn btn-outline-primary ms-2" 
                  disabled={currentPage >= totalPages} 
                  onClick={() => setCurrentPage(c => c + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
