import './VideoFeed.css';
import { Link } from 'react-router-dom';

function VideoFeed({ videos, isDarkMode, onLoadMore, hasMore, totalVideos, isLoadingMore }) {
    return (
        <div>
            {videos.length === 0 && !isLoadingMore ? (
                <div className='mt-4'>No videos found. Try another search/category.</div>
            ) : (
                <div className="feed">
                    {videos.map((video, index) => (
                        <Link to={`/VideoPage/${video.id}`} className="card-link" key={video.id || index}>
                            <div className={isDarkMode ? "card text-bg-dark" : "card"}>
                                <img src={video.thumbnailUrl} className="videoThumbnail" alt="Video Thumbnail" />
                                <div className={isDarkMode ? "title-dark" : "title"}>{video.title}</div>
                                <div className={isDarkMode ? "uploader-dark" : "uploader"}>{video.uploaderName}</div>
                                <div className={isDarkMode ? "views-time-dark" : "views-time"}>{video.views} views &bull; {new Date(video.createdAt).toLocaleDateString()}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {videos.length > 0 && totalVideos !== undefined && (
                <div className="text-center mt-3 mb-2 text-muted">
                    Showing {videos.length} of {totalVideos} videos
                </div>
            )}
            
            {hasMore && (
                <div className="text-center my-4">
                    <button 
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default VideoFeed;
