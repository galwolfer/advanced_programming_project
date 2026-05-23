import { useState } from 'react';
import './CommentSection.css';
import { unstable_useViewTransitionState } from 'react-router-dom';

function CommentSection({ signedInUser, videoId, comments, setComments, isDarkMode }) {
    const [newComment, setNewComment] = useState('');

    const handleInputChange = (e) => {
        setNewComment(e.target.value);
    };

    const postComment = () => {
        if (!signedInUser){
            alert('You need to be signed in to comment');
            setNewComment('');
            return;
        }
        if (newComment.trim() === '') {
            alert('Comment cannot be empty');
            return;
        }

        const commentObject = {
            id: Date.now(), // Add an id to each comment
            text: newComment,
            author: signedInUser.displayName,
            timestamp: new Date(),
            profilePicture: signedInUser.profilePicture ? URL.createObjectURL(signedInUser.profilePicture) : "/thumbnails/defaultThumbnail.png", // Add profile picture to comment object
        };

        // Ensure comments[videoId] is initialized as an object
        const currentVideo = { ...comments[videoId] };

        // Update comments for the specific video
        if (!currentVideo.comments) {
            currentVideo.comments = []; // Initialize comments array if not already present
        }
        currentVideo.comments.unshift(commentObject); // Add new comment to the beginning

        // Update App's state with updated video object
        setComments(prevComments => ({
            ...prevComments,
            [videoId]: currentVideo
        }));

        // Clear input after posting comment
        setNewComment('');
    };

    const deleteComment = (commentId) => {
        const currentVideo = { ...comments[videoId] };
        currentVideo.comments = currentVideo.comments.filter(comment => comment.id !== commentId);

        setComments(prevComments => ({
            ...prevComments,
            [videoId]: currentVideo
        }));
    };

    // Function to format timestamp to 'x minutes ago' until 1 minute ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const seconds = Math.floor((now - timestamp) / 1000);
        const minutes = Math.floor(seconds / 60);

        if (minutes === 0) {
            return `0 minutes ago`;
        } else if (minutes === 1) {
            return `1 minute ago`;
        } else {
            return `${minutes} minutes ago`;
        }
    };

    return (
        <div className='comment-section'>
            <div className='new-comment'>
                <input
                    type='text'
                    className='new-comment-text'
                    value={newComment}
                    onChange={handleInputChange}
                    placeholder='Enter your comment here'
                />
                <button type="button" className="btn btn-danger" id='post-button' onClick={postComment}>Post</button>
            </div>
            <div className='comments'>
                {comments[videoId]?.comments && comments[videoId].comments.map((comment, index) => (
                    <div key={comment.id} className='comment'>
                        <div className='comment-details'>
                            {comment.profilePicture && (
                                <img src={comment.profilePicture}  className="profile-picture" />
                            )}
                            <div className={isDarkMode ? "author-dark" : "author"}>{comment.author}</div>
                            <div className={isDarkMode ? "timestamp-dark" : "timestamp"}>{formatTimeAgo(comment.timestamp)}</div>
                            {signedInUser && comment.author === signedInUser.displayName && (
                                <button className="btn btn-danger btn-sm" id='deleteBtn' onClick={() => deleteComment(comment.id)}>Delete</button>
                            )}
                        </div>
                        <div className={isDarkMode ? "comment-text-dark" : "comment-text"}>{comment.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommentSection;
