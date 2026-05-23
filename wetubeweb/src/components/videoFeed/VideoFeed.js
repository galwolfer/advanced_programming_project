import './VideoFeed.css';
import { Link } from 'react-router-dom';

function VideoFeed({ videos, isDarkMode }) {
   
    
    return (
        
        <div className="feed">
            {videos.map((video, index) => (
                <Link to={`/VideoPage/${video.id}`} className="card-link" key={index}>
                    <div className={isDarkMode ? "card text-bg-dark" : "card"}>
                        <img src={video.thumbnailPath} className="videoThumbnail" alt="Video Thumbnail" />
                        <div className={isDarkMode ? "title-dark" : "title"}>{video.title}</div>
                        <div className={isDarkMode ? "uploader-dark" : "uploader"}>{video.uploader}</div>
                        <div className={isDarkMode ? "views-time-dark" : "views-time"}>{video.views} &bull; {video.uploaded}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default VideoFeed;
