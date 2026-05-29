import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedVideos } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import UpperLayout from '../components/upperLayout/UpperLayout';
import VideoFeed from '../components/videoFeed/VideoFeed';
import icon from '../logo.svg';
import './LikedVideosPage.css';

function LikedVideosPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const [videos, setVideos] = useState([]);
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

  const loadLikedVideos = useCallback(async (page) => {
    if (!token) return;
    setLoading(true);
    setPageError('');
    try {
      const data = await fetchLikedVideos(page, 20, token);
      setVideos(data.videos || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLikedVideos(currentPage);
  }, [loadLikedVideos, currentPage]);

  const toggleMode = () => {
    setDarkMode((prev) => !prev);
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
          
          <div className="liked-container mt-4 px-3">
            <h2 className={`mb-4 ${isDarkMode ? "text-light" : "text-dark"}`}>Liked videos</h2>
            
            {pageError ? <div className="alert alert-danger">{pageError}</div> : null}
            
            {loading ? (
              <div className="mt-4">Loading liked videos...</div>
            ) : videos.length === 0 ? (
              <div className="mt-4">You haven't liked any videos yet.</div>
            ) : (
              <VideoFeed videos={videos} isDarkMode={isDarkMode} />
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4 mb-4">
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

export default LikedVideosPage;
