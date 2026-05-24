import { useState } from 'react';
import './CommentSection.css';

function CommentSection({ signedInUser, comments, isDarkMode, onAddComment, onDeleteComment }) {
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleInputChange = (e) => {
        setNewComment(e.target.value);
    };

    const postComment = async () => {
        if (!signedInUser){
            alert('You need to be signed in to comment');
            setNewComment('');
            return;
        }
        if (newComment.trim() === '') {
            alert('Comment cannot be empty');
            return;
        }

        try {
            setIsPosting(true);
            await onAddComment(newComment);
            setNewComment('');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsPosting(false);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await onDeleteComment(commentId);
        } catch (error) {
            alert(error.message);
        }
    };

    // Function to format timestamp to 'x minutes ago' until 1 minute ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const timestampDate = new Date(timestamp);
        const seconds = Math.floor((now - timestampDate) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes === 0) {
            return `0 minutes ago`;
        } else if (minutes === 1) {
            return `1 minute ago`;
        } else if (hours < 1) {
            return `${minutes} minutes ago`;
        } else if (hours === 1) {
            return '1 hour ago';
        } else if (days < 1) {
            return `${hours} hours ago`;
        } else if (days === 1) {
            return '1 day ago';
        } else {
            return `${days} days ago`;
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
                <button type="button" className="btn btn-danger" id='post-button' onClick={postComment} disabled={isPosting}>Post</button>
            </div>
            <div className='comments'>
                {comments.map((comment) => (
                    <div key={comment.id} className='comment'>
                        <div className='comment-details'>
                            {comment.authorAvatarUrl && (
                                <img src={comment.authorAvatarUrl} className="profile-picture" alt='avatar' />
                            )}
                            <div className={isDarkMode ? "author-dark" : "author"}>{comment.authorName}</div>
                            <div className={isDarkMode ? "timestamp-dark" : "timestamp"}>{formatTimeAgo(comment.createdAt)}</div>
                            {signedInUser && comment.authorId === signedInUser.id && (
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
