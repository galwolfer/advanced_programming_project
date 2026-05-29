import React, { useEffect, useState } from 'react';
import { checkSubscription, subscribeToChannel, unsubscribeFromChannel } from '../../api/client';
import './SubscribeButton.css';

function SubscribeButton({ channelId, signedInUser, token, isDarkMode }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function fetchSubStatus() {
            if (!signedInUser || signedInUser.id === channelId) {
                setLoading(false);
                return;
            }

            try {
                const result = await checkSubscription(channelId, token);
                if (!ignore) {
                    setIsSubscribed(result.isSubscribed);
                }
            } catch (error) {
                console.error("Failed to check subscription:", error);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchSubStatus();

        return () => {
            ignore = true;
        };
    }, [channelId, signedInUser, token]);

    const handleSubscribeToggle = async () => {
        if (!signedInUser) return;
        setLoading(true);

        try {
            if (isSubscribed) {
                await unsubscribeFromChannel(channelId, token);
                setIsSubscribed(false);
            } else {
                await subscribeToChannel(channelId, token);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error("Failed to toggle subscription:", error);
            alert(error.message || "Failed to change subscription status");
        } finally {
            setLoading(false);
        }
    };

    if (!signedInUser) {
        return (
            <button className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} subscribe-btn`} disabled>
                Sign in to subscribe
            </button>
        );
    }

    if (signedInUser.id === channelId) {
        return null; // Don't show for own channel
    }

    return (
        <button 
            className={`btn btn-sm subscribe-btn ${isSubscribed ? 'btn-secondary' : 'btn-danger'}`} 
            onClick={handleSubscribeToggle}
            disabled={loading}
        >
            {loading ? '...' : (isSubscribed ? 'Subscribed' : 'Subscribe')}
        </button>
    );
}

export default SubscribeButton;
