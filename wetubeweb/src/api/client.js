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
