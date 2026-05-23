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
import { useState } from 'react';
import UploadPage from '../uploadVideo/UploadPage';
import initialVideos from '../videos.json'; // Updated path
import CommentSection from '../components/commentSection/CommentSection';

function MainLayout({ signedInUser, videos, comments, setComments, setUser, isDarkMode, setDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');

  function toggleMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
    setDarkMode(!isDarkMode);
  }

  const filteredVideos = videos.filter(video => video.title.toLowerCase().startsWith(searchQuery.toLowerCase()));

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2">
          <div className='appName'></div>
          <img src={icon} className='appIcon' />
          <LeftMenu isDarkMode={isDarkMode} />
        </div>
        <div className="col-10">
          <button type="button" className="btn btn-dark" id='darkModeButton' onClick={toggleMode}>Dark mode</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
          <HomeNavbar />
          <VideoFeed videos={filteredVideos} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

function VideoPageLayout({ signedInUser, videos, comments, setComments, setUser, isDarkMode, setDarkMode, deleteVideo }) {
  function toggleMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
    setDarkMode(!isDarkMode)
  }
  const { id } = useParams();
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2">
          <img src={icon} className='appIcon' />
          <SpecialLeftMenu isDarkMode={isDarkMode} />
        </div>
        <div className="col-10">
        <button type="button" class="btn btn-dark" id='darkModeButton' onClick={toggleMode} >Dark mode</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} />
          <VideoPlay id={id} allVideos={videos} signedInUser={signedInUser} isDarkMode={isDarkMode} deleteVideo={deleteVideo} />
          <CommentSection
            signedInUser={signedInUser}
            videoId={id}
            comments={comments}
            setComments={setComments}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [signedUpUsers, setSignedUpUsers] = useState([]); // State to store signed up users
  const [signedInUser, setSignedInUser] = useState(null); // State to store signed in user
  const [videos, setVideos] = useState(initialVideos); // State to store videos
  const [comments, setComments] = useState({}); // State to store comments for videos
  const[isDarkMode, setDarkMode] = useState(false);

  const deleteVideo = (id) => {
    setVideos(videos.filter(video => video.id !== id));
  };

  const addVideo = (newVideo) => {
    setVideos((prevVideos) => [...prevVideos, newVideo]);
  };

  return (
    <Routes>
      <Route path='/VideoPage/:id' element={<VideoPageLayout signedInUser={signedInUser} videos={videos} comments={comments} setComments={setComments} setUser={setSignedInUser} isDarkMode={isDarkMode} setDarkMode={setDarkMode} deleteVideo={deleteVideo} />} />
      <Route path='/' element={<MainLayout signedInUser={signedInUser} videos={videos} comments={comments} setComments={setComments} setUser={setSignedInUser} isDarkMode={isDarkMode} setDarkMode={setDarkMode} />} />
      <Route path="/signup" element={<SignUpPage signedUpUsers={signedUpUsers} setSignedUpUsers={setSignedUpUsers} />} />
      <Route path="/signin" element={<SignInPage signedUpUsers={signedUpUsers} setSignedInUser={setSignedInUser} />} />
      <Route path="/upload" element={<UploadPage addVideo={addVideo} user={signedInUser} />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
