const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function withAuth(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signUp(payload) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signIn(payload) {
  return request("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe(token) {
  return request("/auth/me", {
    headers: withAuth(token),
  });
}

export async function fetchVideos(params = {}, token) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/videos${query}`, {
    headers: withAuth(token),
  });
}

export async function fetchVideoDetails(videoId, token) {
  return request(`/videos/${videoId}`, {
    headers: withAuth(token),
  });
}

export async function uploadVideo(payload, token) {
  return request("/videos", {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export async function toggleLike(videoId, token) {
  return request(`/videos/${videoId}/like`, {
    method: "POST",
    headers: withAuth(token),
  });
}

export async function incrementView(videoId) {
  return request(`/videos/${videoId}/view`, {
    method: "POST",
  });
}

export async function addComment(videoId, text, token) {
  return request(`/videos/${videoId}/comments`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify({ text }),
  });
}

export async function deleteComment(videoId, commentId, token) {
  return request(`/videos/${videoId}/comments/${commentId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function deleteVideo(videoId, token) {
  return request(`/videos/${videoId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function fetchUserProfile(userId) {
  return request(`/users/${userId}`);
}

export async function fetchUserVideos(userId, page = 1, limit = 20) {
  return request(`/users/${userId}/videos?page=${page}&limit=${limit}`);
}

export async function updateProfile(payload, token) {
  return request("/users/profile", {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export async function checkSubscription(channelId, token) {
  return request(`/subscriptions/check/${channelId}`, {
    headers: withAuth(token),
  });
}

export async function subscribeToChannel(channelId, token) {
  return request(`/subscriptions/${channelId}`, {
    method: "POST",
    headers: withAuth(token),
  });
}

export async function unsubscribeFromChannel(channelId, token) {
  return request(`/subscriptions/${channelId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function updateVideo(videoId, payload, token) {
  return request(`/videos/${videoId}`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

// Playlist API endpoints
export async function fetchMyPlaylists(token) {
  return request("/playlists", {
    headers: withAuth(token),
  });
}

export async function createPlaylist(payload, token) {
  return request("/playlists", {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export async function fetchPlaylist(id, token) {
  return request(`/playlists/${id}`, {
    headers: withAuth(token),
  });
}

export async function updatePlaylist(id, payload, token) {
  return request(`/playlists/${id}`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export async function deletePlaylist(id, token) {
  return request(`/playlists/${id}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function addVideoToPlaylist(playlistId, videoId, token) {
  return request(`/playlists/${playlistId}/videos`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify({ videoId }),
  });
}

export async function removeVideoFromPlaylist(playlistId, videoId, token) {
  return request(`/playlists/${playlistId}/videos/${videoId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function fetchUserPlaylists(userId) {
  return request(`/users/${userId}/playlists`);
}

// History API endpoints
export async function fetchHistory(page = 1, limit = 20, token) {
  return request(`/history?page=${page}&limit=${limit}`, {
    headers: withAuth(token),
  });
}

export async function clearHistory(token) {
  return request("/history", {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export async function removeHistoryEntry(videoId, token) {
  return request(`/history/${videoId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

// Subscriptions API endpoint
export async function fetchSubscriptionFeed(page = 1, limit = 20, token) {
  return request(`/subscriptions/feed?page=${page}&limit=${limit}`, {
    headers: withAuth(token),
  });
}

// Liked videos helper (uses existing fetchVideos but passes liked=true)
export async function fetchLikedVideos(page = 1, limit = 20, token) {
  return fetchVideos({ liked: true, page, limit }, token);
}


export async function fetchRecommendations(videoId) {
  return request(`/videos/${videoId}/recommendations`);
}

export async function uploadFile(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }
  return data;
}
