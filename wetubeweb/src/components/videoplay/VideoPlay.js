import React, { useEffect, useState } from "react";
import './VideoPlay.css';
import { Tooltip } from "bootstrap";
import { useNavigate } from 'react-router-dom';

function VideoPlay({ id, allVideos, signedInUser, isDarkMode, deleteVideo }) {
    const [like, setLike] = useState(false);
    const [dislike, setDislike] = useState(false);
    const thisVideo = allVideos.find(video => video.id === id);
    const [countLikes, setCountLikes] = useState(thisVideo.likes);
    const navigate = useNavigate();

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, []);

    const likeVideo = () => {
        if (signedInUser) {
            if (!like) {
                setCountLikes(countLikes + 1);
            } else {
                setCountLikes(countLikes - 1);
            }
            if (dislike) {
                setDislike(false);
            }
            setLike(!like);
        } else {
            alert('You need to be signed in to like!');
        }
    };

    const dislikeVideo = () => {
        if (signedInUser) {
            if (like) {
                setCountLikes(countLikes - 1);
                setLike(false);
            }
            setDislike(!dislike);
        } else {
            alert('You need to be signed in to dislike!');
        }
    };

    const handleDelete = () => {
        if (signedInUser) {
            if (signedInUser.displayName === thisVideo.uploader) {
                deleteVideo(thisVideo.id);
                navigate('/');
                return;
            } else {
                alert('You cant delete the video since you are not the uploader.')
            }
        }
        else {
            alert('You cant delete the video since you are not the uploader.')
        }
    };

    return (
        <div className="video-play">
            <video src={thisVideo.path} controls autoPlay muted>
                <source src={thisVideo.path} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className={isDarkMode ? "video-title-dark" : "video-title"}>{thisVideo.title}</div>
            <div className="info-row">
                <div className={isDarkMode ? "uploader-dark" : "uploader"}>{thisVideo.uploader}</div>
                <div className="btn-group" id="like-dislike" role="group" aria-label="Basic outlined example">
                    {like ? (
                        <button type="button" className="btn btn-outline-danger" onClick={likeVideo} id="liked">
                            <i className="bi bi-hand-thumbs-up"> {countLikes}</i>
                        </button>
                    ) : (
                        <button type="button" className="btn btn-outline-danger" onClick={likeVideo}>
                            <i className="bi bi-hand-thumbs-up"> {countLikes}</i>
                        </button>
                    )}
                    {dislike ? (
                        <button type="button" className="btn btn-outline-danger" onClick={dislikeVideo} id="disliked">
                            <i className="bi bi-hand-thumbs-down"></i>
                        </button>
                    ) : (
                        <button type="button" className="btn btn-outline-danger" onClick={dislikeVideo}>
                            <i className="bi bi-hand-thumbs-down"></i>
                        </button>
                    )}
                </div>
                <button type="button" className="btn btn-outline-danger" id="share-button">Share</button>
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete} id="delete-button">Delete</button>
            </div>
            <div className={isDarkMode ? "subscribers-num-dark" : "subscribers-num"}>846K subscribers</div>
        </div>
    );
}

export default VideoPlay;
