import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

function UploadPage({ addVideo, user }) {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [draggingVideo, setDraggingVideo] = useState(false);
  const [draggingThumbnail, setDraggingThumbnail] = useState(false);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const navigate = useNavigate();

  function handleVideoChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please upload a valid video file.');
    }
  }

  function handleThumbnailChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      alert('Please upload a valid image file.');
    }
  }

  function handleUpload() {
    if (!videoFile) return;

    const newVideo = {
      id: Date.now().toString(),
      path: URL.createObjectURL(videoFile),
      thumbnailPath: thumbnailFile ? URL.createObjectURL(thumbnailFile) : "/thumbnails/defaultThumbnail.png", // Use default thumbnail if none provided
      title,
      description,
      uploader: user.displayName,
      views: 0,
      uploaded: new Date().toLocaleDateString(),
      likes: 0
    };

    addVideo(newVideo);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          navigate('/'); // Redirect to the home page when upload is complete
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }

  function handleDragOver(e, type) {
    e.preventDefault();
    if (type === 'video') {
      setDraggingVideo(true);
    } else {
      setDraggingThumbnail(true);
    }
  }

  function handleDragLeave(e, type) {
    e.preventDefault();
    if (type === 'video') {
      setDraggingVideo(false);
    } else {
      setDraggingThumbnail(false);
    }
  }

  function handleDrop(e, type) {
    e.preventDefault();
    if (type === 'video') {
      setDraggingVideo(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        alert('Please drop a valid video file.');
      }
    } else {
      setDraggingThumbnail(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setThumbnailFile(file);
      } else {
        alert('Please drop a valid image file.');
      }
    }
  }

  function handleButtonClick(type) {
    if (type === 'video') {
      videoInputRef.current.click();
    } else {
      thumbnailInputRef.current.click();
    }
  }

  

  return (
    <div className="upload-page">
      <h1>Upload Video</h1>
      <h2>Uploading as: {user.username}</h2>
      <div
        className={`drop-zone ${draggingVideo ? 'dragging' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'video')}
        onDragLeave={(e) => handleDragLeave(e, 'video')}
        onDrop={(e) => handleDrop(e, 'video')}
        onClick={() => handleButtonClick('video')} // Trigger file input click on div click
      >
        {videoFile ? (
          <p>{videoFile.name}</p>
        ) : (
          <p>Drag and drop a video file here, or click to select one</p>
        )}
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          ref={videoInputRef}
          style={{ display: 'none' }}
        />
      </div>
      <div
        className={`drop-zone ${draggingThumbnail ? 'dragging' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'thumbnail')}
        onDragLeave={(e) => handleDragLeave(e, 'thumbnail')}
        onDrop={(e) => handleDrop(e, 'thumbnail')}
        onClick={() => handleButtonClick('thumbnail')} // Trigger file input click on div click
      >
        {thumbnailFile ? (
          <p>{thumbnailFile.name}</p>
        ) : (
          <p>Drag and drop a thumbnail image here, or click to select one (optional)</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          ref={thumbnailInputRef}
          style={{ display: 'none' }}
        />
      </div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;