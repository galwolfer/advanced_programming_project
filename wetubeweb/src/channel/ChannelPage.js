import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserProfile, fetchUserVideos, checkSubscription, subscribeToChannel, unsubscribeFromChannel } from '../api/client';
import LeftMenu from '../components/leftMenu/LeftMenu';
import icon from '../logo.svg';
import UpperLayout from '../components/upperLayout/UpperLayout';
import VideoFeed from '../components/videoFeed/VideoFeed';
import './ChannelPage.css';

function ChannelPage({ signedInUser, token, setUser, isDarkMode, setDarkMode, setSearchQuery }) {
  const { userId } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  function toggleMode() {
    setDarkMode((prev) => !prev);
  }

  useEffect(() => {
    let ignore = false;

    async function loadChannelData() {
      setLoading(true);
      setError('');

      try {
        const profileData = await fetchUserProfile(userId);
        if (!ignore) setChannelInfo(profileData);

        const videosData = await fetchUserVideos(userId, 1, 20);
        if (!ignore) setVideos(videosData.videos || []);

        if (signedInUser && token && signedInUser.id !== userId) {
          try {
            const subData = await checkSubscription(userId, token);
            if (!ignore) setIsSubscribed(subData.subscribed);
          } catch (subErr) {
            console.error('Failed to check subscription:', subErr);
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load channel');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadChannelData();

    return () => {
      ignore = true;
    };
  }, [userId, signedInUser, token]);

  const handleSubscribeToggle = async () => {
    if (!token || !signedInUser) return;
    setSubscribing(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(userId, token);
        setIsSubscribed(false);
        setChannelInfo((prev) => ({ ...prev, subscribersCount: Math.max(0, (prev.subscribersCount || 1) - 1) }));
      } else {
        await subscribeToChannel(userId, token);
        setIsSubscribed(true);
        setChannelInfo((prev) => ({ ...prev, subscribersCount: (prev.subscribersCount || 0) + 1 }));
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const isOwnChannel = signedInUser && signedInUser.id === userId;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2">
          <img src={icon} className='appIcon' alt='WeTube logo' />
          <LeftMenu isDarkMode={isDarkMode} signedInUser={signedInUser} />
        </div>
        <div className="col-10">
          <button type="button" className="btn btn-dark" id='darkModeButton' onClick={toggleMode}>Dark mode</button>
          <UpperLayout user={signedInUser} setUser={setUser} isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
          
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          
          {loading ? (
            <div className="mt-4">Loading channel...</div>
          ) : channelInfo ? (
            <div className={`channel-container ${isDarkMode ? 'dark' : ''}`}>
              <div 
                className="channel-banner" 
                style={{ 
                  backgroundImage: channelInfo.bannerUrl ? `url(${channelInfo.bannerUrl})` : 'linear-gradient(to right, #ff0000, #ff7f00)'
                }}
              ></div>
              
              <div className="channel-header d-flex align-items-center p-4">
                <img 
                  src={channelInfo.profilePictureUrl || 'https://via.placeholder.com/150'} 
                  alt={channelInfo.displayName} 
                  className="channel-profile-pic rounded-circle me-4" 
                />
                <div className="channel-info flex-grow-1">
                  <h2>{channelInfo.displayName}</h2>
                  <p className="text-muted mb-1">@{channelInfo.username} &bull; {channelInfo.subscribersCount || 0} subscribers &bull; {channelInfo.videoCount || videos.length} videos</p>
                  <p className="channel-description mb-2">{channelInfo.description || 'No description available.'}</p>
                </div>
                
                <div className="channel-actions">
                  {isOwnChannel ? (
                    <Link to="/settings/profile" className="btn btn-secondary">Edit Channel</Link>
                  ) : signedInUser ? (
                    <button 
                      className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-danger'}`} 
                      onClick={handleSubscribeToggle}
                      disabled={subscribing}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  ) : null}
                </div>
              </div>
              
              <hr className={isDarkMode ? "border-secondary" : ""} />
              
              <div className="channel-videos p-3">
                <h4 className="mb-4">Videos</h4>
                <VideoFeed videos={videos} isDarkMode={isDarkMode} />
              </div>
            </div>
          ) : (
            <div className="mt-4">Channel not found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChannelPage;