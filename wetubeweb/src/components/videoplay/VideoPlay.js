import React, { useEffect, useState } from "react";
import './VideoPlay.css';
import { Tooltip } from "bootstrap";
import { useNavigate } from 'react-router-dom';

function VideoPlay({ video, signedInUser, isDarkMode, onToggleLike, onDeleteVideo }) {
    const [isSubmittingLike, setIsSubmittingLike] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, []);

    const likeVideo = async () => {
        try {
            setIsSubmittingLike(true);
            await onToggleLike();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmittingLike(false);
        }
    };

    const handleDelete = async () => {
        if (signedInUser && signedInUser.id === video.uploaderId) {
            try {
                await onDeleteVideo();
                navigate('/');
            } catch (error) {
                alert(error.message);
            }
            return;
        }

        alert('You cant delete the video since you are not the uploader.');
    };

    return (
        <div className="video-play">
            <video src={video.videoUrl} controls autoPlay muted>
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className={isDarkMode ? "video-title-dark" : "video-title"}>{video.title}</div>
            <div className="info-row">
                <div className={isDarkMode ? "uploader-dark" : "uploader"}>{video.uploaderName}</div>
                <div className="btn-group" id="like-dislike" role="group" aria-label="Basic outlined example">
                    <button type="button" className="btn btn-outline-danger" onClick={likeVideo} id={video.likedByCurrentUser ? 'liked' : ''} disabled={isSubmittingLike}>
                        <i className="bi bi-hand-thumbs-up"> {video.likesCount}</i>
                    </button>
                </div>
                <button type="button" className="btn btn-outline-danger" id="share-button">Share</button>
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete} id="delete-button">Delete</button>
            </div>
            <div className={isDarkMode ? "subscribers-num-dark" : "subscribers-num"}>846K subscribers</div>
            {video.description ? <p className="mt-3">{video.description}</p> : null}
        </div>
    );
}

export default VideoPlay;
