import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';
import { uploadVideo } from '../api/client';

function UploadPage({ token, user, onUploadSuccess }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  async function handleUpload() {
    if (!user || !token) {
      alert('Please sign in first.');
      return;
    }

    if (!videoUrl || !thumbnailUrl || !title) {
      setErrorMessage('Title, video URL and thumbnail URL are required.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await uploadVideo(
        {
          title,
          description,
          videoUrl,
          thumbnailUrl,
          category,
        },
        token
      );
      await onUploadSuccess();
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="upload-page">
        <h1>Upload Video</h1>
        <p>You need to sign in to upload videos.</p>
        <button onClick={() => navigate('/signin')}>Go to Sign In</button>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <h1>Upload Video</h1>
      <h2>Uploading as: {user.username}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Category (e.g. Gaming, Nature)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="url"
        placeholder="Video URL (e.g. /ex1videos/video1.mp4 or https://...)"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <input
        type="url"
        placeholder="Thumbnail URL (e.g. /thumbnails/thumbnail1.png)"
        value={thumbnailUrl}
        onChange={(e) => setThumbnailUrl(e.target.value)}
      />
      {errorMessage ? <div className="alert alert-danger mt-2">{errorMessage}</div> : null}
      <button onClick={handleUpload} disabled={isSubmitting}>
        {isSubmitting ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default UploadPage;