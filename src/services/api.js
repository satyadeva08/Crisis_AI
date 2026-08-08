const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Attach auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  
  // For file uploads (multipart/form-data)
  upload: (endpoint, formData) => {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData, // Don't set Content-Type — browser sets it with boundary
    }).then(res => {
      if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
      return res.json();
    });
  },
};
