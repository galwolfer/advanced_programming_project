import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecommendations } from '../../api/client';
import './RelatedVideos.css';

function RelatedVideos({ videoId, isDarkMode }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadRecommendations() {
            setLoading(true);
            try {
                const data = await fetchRecommendations(videoId);
                if (!ignore) {
                    setVideos(data.videos || []);
                }
            } catch (err) {
                if (!ignore) {
                    setError('Failed to load related videos.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        if (videoId) {
            loadRecommendations();
        }

        return () => {
            ignore = true;
        };
    }, [videoId]);

    if (loading) return <div className="p-3 text-muted">Loading related videos...</div>;
    if (error) return <div className="p-3 text-danger">{error}</div>;
    if (!videos.length) return null;

    return (
        <div className={`related-videos-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <h5 className="mb-3 pl-2">Related Videos</h5>
            <div className="related-videos-list">
                {videos.map((video) => (
                    <Link to={`/VideoPage/${video.id}`} key={video.id} className="related-video-card">
                        <img src={video.thumbnailUrl} alt={video.title} className="related-thumbnail" />
                        <div className="related-info">
                            <div className="related-title" title={video.title}>{video.title}</div>
                            <div className="related-uploader">{video.uploaderName}</div>
                            <div className="related-views">{video.views} views</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RelatedVideos;
