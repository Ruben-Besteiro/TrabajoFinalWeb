// Helper para hacer fetch a Spotify con refresh automático

export async function spotifyFetch(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Si el token expiró o se borró, intentar refrescar
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/refresh-token');
    
    if (!refreshResponse.ok) {
      throw new Error('REFRESH_FAILED');
    }

    const refreshData = await refreshResponse.json();
    
    if (!refreshData.access_token) {
      throw new Error('REFRESH_FAILED');
    }

    // Reintentar la petición original con el nuevo token
    const retryResponse = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${refreshData.access_token}`,
      },
    });

    return retryResponse;
  }

  return response;
}