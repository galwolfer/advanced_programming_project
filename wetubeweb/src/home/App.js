import './App.css';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';
import UpperLayout from '../components/upperLayout/UpperLayout';
import VideoFeed from '../components/videoFeed/VideoFeed';
import { Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';
import VideoPlay from '../components/videoplay/VideoPlay';
import SpecialLeftMenu from '../components/videoPageLeftMenu/SpecialLeftMenu';
import HomeNavbar from '../components/homeNavbar/HomeNavbar';
import SignUpPage from '../signUp/SignUpPage';
import SignInPage from '../signIn/SignInPage';
import { useCallback, useEffect, useState } from 'react';
import UploadPage from '../uploadVideo/UploadPage';
import CommentSection from '../components/commentSection/CommentSection';
import HistoryPage from '../history/HistoryPage';
import LikedVideosPage from '../liked/LikedVideosPage';
import SubscriptionsFeedPage from '../subscriptions/SubscriptionsFeedPage';
import SearchResultsPage from '../search/SearchResultsPage';
import VideoCardSkeleton from '../components/skeletons/VideoCardSkeleton';
import VideoPageSkeleton from '../components/skeletons/VideoPageSkeleton';
import RelatedVideos from '../components/relatedVideos/RelatedVideos';
import ErrorBoundary from '../components/errorBoundary/ErrorBoundary';
import {
  addComment,
  deleteComment,
  deleteVideo,
  fetchMe,
  fetchVideoDetails,
  fetchVideos,
  incrementView,
  toggleLike,
} from '../api/client';

const AUTH_TOKEN_KEY = 'wetube_auth_token';

function MainLayout({
  signedInUser,
  videos,
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  setUser,
  isDarkMode,
  setDarkMode,
  loading,
  loadError,
  setSearchQuery,
  onLoadMore,
  hasMore,
  totalVideos,
  isLoadingMore,
}) {

  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-2 col-md-3 d-none d-md-block sidebar-container">
          <div className='appName'></div>
          <img src={icon} className='appIcon' alt='WeTube logo' />
          <LeftMenu isDarkMode={isDarkMode} signedInUser={signedInUser} />
        </div>
        <div className="col-lg-10 col-md-9 col-sm-12 main-content-container position-relative">
          <button type="button" className="btn btn-secondary btn-sm" id='darkModeButton' onClick={toggleMode}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
          <HomeNavbar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          {loadError ? <div className="alert alert-danger mt-3">{loadError}</div> : null}
          {loading ? (
            <div className="row mt-4">
               {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
            </div>
          ) : (
            <VideoFeed 
              videos={videos} 
              isDarkMode={isDarkMode} 
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              totalVideos={totalVideos}
              isLoadingMore={isLoadingMore}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPageLayout({ signedInUser, token, setUser, isDarkMode, setDarkMode, removeVideoLocally, refreshVideos }) {
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

  const { id } = useParams();

  useEffect(() => {
    let ignore = false;

    async function loadVideo() {
      setLoading(true);
      setPageError('');

      try {
        const { video: loadedVideo, comments: loadedComments } = await fetchVideoDetails(id, token);
        if (!ignore) {
          setVideo(loadedVideo);
          setComments(loadedComments);
        }
        await incrementView(id);
      } catch (error) {
        if (!ignore) {
          setPageError(error.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadVideo();

    return () => {
      ignore = true;
    };
  }, [id, token]);

  const onToggleLike = async () => {
    if (!signedInUser) {
      throw new Error('You need to sign in to like videos.');
    }

    const result = await toggleLike(id, token);
    setVideo((prev) => ({
      ...prev,
      likesCount: result.likesCount,
      likedByCurrentUser: result.likedByCurrentUser,
    }));
    await refreshVideos();
  };

  const onDeleteVideo = async () => {
    await deleteVideo(id, token);
    removeVideoLocally(id);
  };

  const onAddComment = async (text) => {
    const { comment } = await addComment(id, text, token);
    setComments((prev) => [comment, ...prev]);
    setVideo((prev) => ({
      ...prev,
      commentsCount: (prev?.commentsCount || 0) + 1,
    }));
  };

  const onDeleteComment = async (commentId) => {
    await deleteComment(id, commentId, token);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setVideo((prev) => ({
      ...prev,
      commentsCount: Math.max((prev?.commentsCount || 1) - 1, 0),
    }));
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-2 col-md-3 d-none d-md-block sidebar-container">
          <img src={icon} className='appIcon' alt='WeTube logo' />
          <SpecialLeftMenu isDarkMode={isDarkMode} />
        </div>
        <div className="col-lg-10 col-md-9 col-sm-12 main-content-container position-relative">
        <button type="button" className="btn btn-secondary btn-sm" id='darkModeButton' onClick={toggleMode} >{isDarkMode ? 'Light Mode' : 'Dark Mode'}</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} />
          {pageError ? <div className="alert alert-danger mt-3">{pageError}</div> : null}
          
          <div className="row mt-3">
            <div className="col-lg-8 col-12">
              {loading || !video ? (
                <VideoPageSkeleton />
              ) : (
                <>
                  <VideoPlay
                    video={video}
                    signedInUser={signedInUser}
                    isDarkMode={isDarkMode}
                    onToggleLike={onToggleLike}
                    onDeleteVideo={onDeleteVideo}
                    token={token}
                  />
                  <CommentSection
                    signedInUser={signedInUser}
                    comments={comments}
                    isDarkMode={isDarkMode}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                  />
                </>
              )}
            </div>
            <div className="col-lg-4 col-12">
               {video && <RelatedVideos videoId={video.id} isDarkMode={isDarkMode} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [signedInUser, setSignedInUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY) || '');
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setDarkMode] = useState(false);
  
  // Pagination states
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [videosError, setVideosError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const limit = 20;

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    let ignore = false;

    async function bootstrapUser() {
      if (!token) {
        setSignedInUser(null);
        return;
      }

      try {
        const { user } = await fetchMe(token);
        if (!ignore) {
          setSignedInUser(user);
        }
      } catch (error) {
        if (!ignore) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setToken('');
          setSignedInUser(null);
        }
      }
    }

    bootstrapUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const loadVideos = useCallback(async (pageNum = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoadingVideos(true);
      setVideosError('');
    }

    try {
      const result = await fetchVideos(
        {
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy,
          page: pageNum,
          limit,
        },
        token
      );

      const loadedVideos = result.videos || [];
      const loadedCategories = result.categories || ['All'];
      const loadedTotalPages = result.totalPages || 1;
      const loadedTotalVideos = result.totalVideos || loadedVideos.length;

      setVideos(prev => append ? [...prev, ...loadedVideos] : loadedVideos);
      setCategories(loadedCategories);
      setPage(pageNum);
      setTotalPages(loadedTotalPages);
      setTotalVideos(loadedTotalVideos);
    } catch (error) {
      setVideosError(error.message);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoadingVideos(false);
      }
    }
  }, [searchQuery, selectedCategory, sortBy, token]);

  // Initial load or when filters change
  useEffect(() => {
    loadVideos(1, false);
  }, [loadVideos]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadVideos(page + 1, true);
    }
  };

  const setAuthSession = (nextToken, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setSignedInUser(user);
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken('');
    setSignedInUser(null);
  };

  const removeVideoLocally = (id) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
  };

  return (
    <Routes>
      <Route path='/VideoPage/:id' element={<VideoPageLayout signedInUser={signedInUser} token={token} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} removeVideoLocally={removeVideoLocally} refreshVideos={loadVideos} />} />
      <Route path='/' element={<MainLayout signedInUser={signedInUser} videos={videos} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} sortBy={sortBy} setSortBy={setSortBy} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} loading={loadingVideos} loadError={videosError} setSearchQuery={setSearchQuery} />} />
      <Route path="/signup" element={<SignUpPage onAuthSuccess={setAuthSession} />} />
      <Route path="/signin" element={<SignInPage onAuthSuccess={setAuthSession} />} />
      <Route path="/upload" element={<UploadPage token={token} user={signedInUser} onUploadSuccess={loadVideos} />} />
      <Route path="/history" element={<HistoryPage signedInUser={signedInUser} token={token} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} setSearchQuery={setSearchQuery} />} />
      <Route path="/liked" element={<LikedVideosPage signedInUser={signedInUser} token={token} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} setSearchQuery={setSearchQuery} />} />
      <Route path="/feed/subscriptions" element={<SubscriptionsFeedPage signedInUser={signedInUser} token={token} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} setSearchQuery={setSearchQuery} />} />
      <Route path="/search" element={<SearchResultsPage signedInUser={signedInUser} token={token} setUser={signOut} isDarkMode={isDarkMode} setDarkMode={setDarkMode} setSearchQuery={setSearchQuery} />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
