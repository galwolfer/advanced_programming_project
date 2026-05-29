import React, { useEffect, useState } from "react";
import './VideoPlay.css';
import { Tooltip } from "bootstrap";
import { useNavigate, Link } from 'react-router-dom';
import AddToPlaylistModal from "../addToPlaylist/AddToPlaylistModal";
import SubscribeButton from "../subscribeButton/SubscribeButton";

function VideoPlay({ video, signedInUser, isDarkMode, onToggleLike, onDeleteVideo, token }) {
    const [isSubmittingLike, setIsSubmittingLike] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
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
                <Link to={`/channel/${video.uploaderId}`} className={isDarkMode ? "uploader-dark" : "uploader"}>{video.uploaderName}</Link>
                <SubscribeButton channelId={video.uploaderId} signedInUser={signedInUser} token={token} isDarkMode={isDarkMode} />
                <div className="btn-group" id="like-dislike" role="group" aria-label="Basic outlined example">
                    <button type="button" className="btn btn-outline-danger" onClick={likeVideo} id={video.likedByCurrentUser ? 'liked' : ''} disabled={isSubmittingLike}>
                        <i className="bi bi-hand-thumbs-up"> {video.likesCount}</i>
                    </button>
                </div>
                <button type="button" className="btn btn-outline-danger" id="share-button">Share</button>
                {signedInUser && (
                    <button type="button" className="btn btn-outline-danger" id="save-button" onClick={() => setShowPlaylistModal(true)}>
                        <i className="bi bi-plus-circle"></i> Save
                    </button>
                )}
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete} id="delete-button">Delete</button>
            </div>
            {video.description ? <p className="mt-3">{video.description}</p> : null}

            {signedInUser && (
                <AddToPlaylistModal 
                    show={showPlaylistModal} 
                    onHide={() => setShowPlaylistModal(false)} 
                    videoId={video.id} 
                    token={token} 
                />
            )}
        </div>
    );
}

export default VideoPlay;
