import React from 'react';
import './Skeletons.css';

export default function VideoPageSkeleton() {
  return (
    <div className="video-page-skeleton">
      <div className="skeleton skeleton-page-player"></div>
      <div className="skeleton skeleton-page-title"></div>
      <div className="skeleton-page-meta-row">
        <div className="skeleton-page-author">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton skeleton-meta" style={{ width: '150px' }}></div>
        </div>
        <div className="skeleton skeleton-meta" style={{ width: '200px', height: '36px', borderRadius: '18px' }}></div>
      </div>
      <div className="skeleton skeleton-page-desc"></div>
    </div>
  );
}
