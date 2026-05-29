import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVideos } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import UpperLayout from '../components/upperLayout/UpperLayout';
import HomeNavbar from '../components/homeNavbar/HomeNavbar';
import VideoFeed from '../components/videoFeed/VideoFeed';
import icon from '../logo.svg';
import './SearchResultsPage.css';

function SearchResultsPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadResults = useCallback(async (page, currentQuery, category, sort) => {
    setLoading(true);
    setPageError('');
    try {
      const data = await fetchVideos({
        search: currentQuery,
        category: category === 'All' ? '' : category,
        sort: sort,
        page,
        limit: 20
      }, token);
      
      setVideos(data.videos || []);
      if (data.categories) {
        setCategories(data.categories);
      }
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Reset to page 1 when query, category, or sort changes
    setCurrentPage(1);
    loadResults(1, query, selectedCategory, sortBy);
  }, [query, selectedCategory, sortBy, loadResults]);

  useEffect(() => {
    // Load new page when currentPage changes, but avoid double loading if reset triggered it
    loadResults(currentPage, query, selectedCategory, sortBy);
  }, [currentPage, loadResults, query, selectedCategory, sortBy]);

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
          
          <HomeNavbar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          <div className="search-results-container mt-4 px-3">
            <h3 className={`mb-4 ${isDarkMode ? "text-light" : "text-dark"}`}>
              Results for: "{query}"
            </h3>
            
            {pageError ? <div className="alert alert-danger">{pageError}</div> : null}
            
            {loading ? (
              <div className="mt-4">Searching...</div>
            ) : videos.length === 0 ? (
              <div className="mt-4">No videos found for '{query}'. Try a different search.</div>
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

export default SearchResultsPage;
