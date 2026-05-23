
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.png';
import SearchBar from '../components/search/SearchBar';
import UpperLayout from '../components/upperLayout/UpperLayout';
import VideoPlay from '../components/videoplay/VideoPlay';
import { Route, BrowserRouter as Router, Routes, useLocation, useParams } from 'react-router-dom';

function VideoPage() {
const {videoID} = useParams()
  return (
    <div className='VideoPlay-container'>
      <VideoPlay id={videoID} />
    </div>
  );
}

export default VideoPage;
