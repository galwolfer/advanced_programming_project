import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';
import { uploadVideo, uploadFile } from '../api/client';

function UploadPage({ token, user, onUploadSuccess, isDarkMode }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const videoFileRef = useRef(null);
  const thumbnailFileRef = useRef(null);
  const navigate = useNavigate();

  async function handleFileUpload(file, type) {
    if (!file || !token) return;
    setUploadingFile(true);
    try {
      const result = await uploadFile(file, token);
      if (type === 'video') {
        setVideoUrl(result.url);
      } else {
        setThumbnailUrl(result.url);
      }
    } catch (err) {
      setErrorMessage(`Failed to upload ${type} file: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  }

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
      <div className={`upload-page ${isDarkMode ? 'dark' : ''}`}>
        <h1>Upload Video</h1>
        <p>You need to sign in to upload videos.</p>
        <button onClick={() => navigate('/signin')}>Go to Sign In</button>
      </div>
    );
  }

  return (
    <div className={`upload-page ${isDarkMode ? 'dark' : ''}`}>
      <h1>Upload Video</h1>
      <h2>Uploading as: {user.username}</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={isDarkMode ? 'dark-input' : ''}
      />
      <input
        type="text"
        placeholder="Category (e.g. Gaming, Nature)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={isDarkMode ? 'dark-input' : ''}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={isDarkMode ? 'dark-input' : ''}
        rows={3}
      />

      <div className="file-upload-section">
        <label>Video File</label>
        <div
          className={`drop-zone ${videoFile ? 'has-file' : ''}`}
          onClick={() => videoFileRef.current?.click()}
        >
          {videoFile ? (
            <span>{videoFile.name}</span>
          ) : (
            <span>Click to select video file (or enter URL below)</span>
          )}
        </div>
        <input
          ref={videoFileRef}
          type="file"
          accept="video/mp4,video/webm"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setVideoFile(file);
              handleFileUpload(file, 'video');
            }
          }}
        />
        <input
          type="url"
          placeholder="Or enter Video URL (e.g. /ex1videos/video1.mp4)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className={isDarkMode ? 'dark-input' : ''}
        />
      </div>

      <div className="file-upload-section">
        <label>Thumbnail Image</label>
        <div
          className={`drop-zone ${thumbnailFile ? 'has-file' : ''}`}
          onClick={() => thumbnailFileRef.current?.click()}
        >
          {thumbnailFile ? (
            <span>{thumbnailFile.name}</span>
          ) : (
            <span>Click to select thumbnail image (or enter URL below)</span>
          )}
        </div>
        <input
          ref={thumbnailFileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setThumbnailFile(file);
              handleFileUpload(file, 'thumbnail');
            }
          }}
        />
        <input
          type="url"
          placeholder="Or enter Thumbnail URL (e.g. /thumbnails/thumbnail1.png)"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className={isDarkMode ? 'dark-input' : ''}
        />
      </div>

      {uploadingFile && <div className="text-info mt-2">Uploading file...</div>}
      {errorMessage ? <div className="alert alert-danger mt-2">{errorMessage}</div> : null}
      
      <button onClick={handleUpload} disabled={isSubmitting || uploadingFile}>
        {isSubmitting ? 'Uploading...' : uploadingFile ? 'File uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default UploadPage;
