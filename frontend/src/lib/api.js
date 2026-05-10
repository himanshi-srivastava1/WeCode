export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('http://localhost:3000/api/v1/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;

          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry the original request with the new access token
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          config.headers = headers;
          response = await fetch(url, config);
        } else {
          // Refresh failed, user needs to login again
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?error=session_expired';
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login?error=network_error';
      }
    } else {
      // No refresh token available, user needs to login again
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login?error=unauthorized';
    }
  }

  return response;
};
