import React from 'react';
import './Skeletons.css';

export default function VideoCardSkeleton() {
  return (
    <div className="skeleton-video-card col-md-4 col-sm-6 mb-4">
      <div className="skeleton skeleton-thumbnail"></div>
      <div className="skeleton-card-info mt-2">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton-text-group">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-meta"></div>
        </div>
      </div>
    </div>
  );
}
