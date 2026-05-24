import './VideoFeed.css';
import { Link } from 'react-router-dom';

function VideoFeed({ videos, isDarkMode }) {
    if (!videos.length) {
        return <div className='mt-4'>No videos found. Try another search/category.</div>;
    }

    return (
        
        <div className="feed">
            {videos.map((video, index) => (
                <Link to={`/VideoPage/${video.id}`} className="card-link" key={index}>
                    <div className={isDarkMode ? "card text-bg-dark" : "card"}>
                        <img src={video.thumbnailUrl} className="videoThumbnail" alt="Video Thumbnail" />
                        <div className={isDarkMode ? "title-dark" : "title"}>{video.title}</div>
                        <div className={isDarkMode ? "uploader-dark" : "uploader"}>{video.uploaderName}</div>
                        <div className={isDarkMode ? "views-time-dark" : "views-time"}>{video.views} views &bull; {new Date(video.createdAt).toLocaleDateString()}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default VideoFeed;
