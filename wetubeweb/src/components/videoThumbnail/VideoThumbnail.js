import React, { useRef, useEffect, useState } from 'react';
import tempThumbnail from '../../images/tempThumbnail.png';
import './VideoThumbnail.css'
import videos from '../../videos.json'

function VideoThumbnail({ videoUrl }) {
    const videoRef = useRef(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(tempThumbnail);
    let captureTimeout = null;

    const captureThumbnail = () => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = 1;

        const handleSeeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setThumbnailUrl(canvas.toDataURL());
            video.removeEventListener('seeked', handleSeeked);
        };

        video.addEventListener('seeked', handleSeeked);
    };

    useEffect(() => {
        clearTimeout(captureTimeout);
        captureTimeout = setTimeout(captureThumbnail, 500); 
    }, [videoUrl]);

    return (
        <div className="thumbnail-container">
            <video ref={videoRef} src={videoUrl} style={{ display: 'none' }} />
            <img src={thumbnailUrl} alt="Video Thumbnail" className="thumbnail-image" />
        </div>
    );
}

export default VideoThumbnail;
