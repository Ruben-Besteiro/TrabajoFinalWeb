// API route para generar la playlist cuando le damos al botón
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getValidAccessToken(cookieStore) {
  let accessToken = cookieStore.get("access_token")?.value;
  let needsRefresh = false;

  // Si no hay token o si el token es inválido, intentar refrescar
  if (accessToken) {
    // Hacer una petición de prueba para verificar si el token es válido
    const testResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (testResponse.status === 401) {
      needsRefresh = true;
    } else if (testResponse.ok) {
      // Token válido, devolverlo
      return { token: accessToken, refreshed: false };
    }
  } else {
    // No hay token, intentar refrescar
    needsRefresh = true;
  }

  // Intentar refrescar el token
  if (needsRefresh) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) {
      return null;
    }

    const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      })
    });

    const data = await refreshResponse.json();
    
    if (data.access_token) {
      return { token: data.access_token, refreshed: true, newRefreshToken: data.refresh_token };
    }
    
    return null;
  }

  return { token: accessToken, refreshed: false };
}

export async function POST(request) {
  const cookieStore = await cookies();
  const tokenResult = await getValidAccessToken(cookieStore);

  if (!tokenResult) {
    return NextResponse.json({ 
      error: "No autenticado o sesión expirada",
      needsLogin: true 
    }, { status: 401 });
  }

  const accessToken = tokenResult.token;

  try {
    const { genres, years, tracks } = await request.json();
    let allTracks = [];

    // 1. Añadir primero las canciones seleccionadas manualmente (sin filtros)
    if (tracks && tracks.length > 0) {
      allTracks = [...tracks];
    }

    // 2. Buscar por géneros y aplicar filtros
    if (genres && genres.length > 0) {
      for (const genre of genres) {
        const searchUrl = `https://api.spotify.com/v1/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=50`;
        
        const response = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Verificar si el token expiró
        if (response.status === 401) {
          return NextResponse.json({ 
            error: "Token expirado, por favor inicia sesión nuevamente",
            expired: true 
          }, { status: 401 });
        }

        if (!response.ok) {
          console.error(`Error en búsqueda de género ${genre}:`, response.status);
          continue; // Continuar con el siguiente género
        }

        const data = await response.json();
        if (data.tracks?.items) {
          allTracks = [...allTracks, ...data.tracks.items];
        }
      }
    }

    // 3. Filtrar por año SOLO las canciones que NO fueron seleccionadas manualmente
    if (years && years.length === 2 && genres && genres.length > 0) {
      const manualTrackIds = tracks ? tracks.map(t => t.id) : [];
      
      allTracks = allTracks.filter(track => {
        // Si es una canción manual, no aplicar filtro de año
        if (manualTrackIds.includes(track.id)) return true;
        
        // Si no, aplicar filtro de año
        if (!track.album?.release_date) return false;
        const trackYear = parseInt(track.album.release_date.substring(0, 4));
        return trackYear >= years[0] && trackYear <= years[1];
      });
    }

    // 4. Eliminar duplicados por ID
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );

    // 5. Limitar a 50 canciones
    const limitedTracks = uniqueTracks.slice(0, 50);

    const response = NextResponse.json({ tracks: limitedTracks });
    
    // Si el token fue refrescado, actualizar las cookies
    if (tokenResult.refreshed) {
      response.cookies.set("access_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      
      if (tokenResult.newRefreshToken) {
        response.cookies.set("refresh_token", tokenResult.newRefreshToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        });
      }
    }

    return response;
    
  } catch (error) {
    console.error('Error generando playlist:', error);
    return NextResponse.json({ 
      error: "Error al generar la playlist",
      details: error.message 
    }, { status: 500 });
  }
}