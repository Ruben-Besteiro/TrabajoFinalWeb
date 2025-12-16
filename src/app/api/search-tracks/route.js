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

export async function GET(request) {
  const cookieStore = await cookies();
  const tokenResult = await getValidAccessToken(cookieStore);

  if (!tokenResult) {
    return NextResponse.json({ 
      error: "No autenticado o sesión expirada",
      needsLogin: true 
    }, { status: 401 });
  }

  const accessToken = tokenResult.token;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Falta query" }, { status: 400 });
  }

  try {
    // Buscar por múltiples términos separados por coma
    const terms = query.split(',').map(t => t.trim()).filter(t => t);
    let allTracks = [];

    for (const term of terms) {
      const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}&limit=10`;
      
      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`Error buscando "${term}":`, response.status);
        continue;
      }

      const data = await response.json();
      if (data.tracks?.items) {
        allTracks = [...data.tracks.items];
      }
    }

    // Eliminar duplicados
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );

    const result = NextResponse.json({ tracks: uniqueTracks });
    
    // Si el token fue refrescado, actualizar las cookies
    if (tokenResult.refreshed) {
      result.cookies.set("access_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      
      if (tokenResult.newRefreshToken) {
        result.cookies.set("refresh_token", tokenResult.newRefreshToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        });
      }
    }

    return result;

  } catch (error) {
    console.error('Error buscando tracks:', error);
    return NextResponse.json({ 
      error: "Error al buscar canciones",
      details: error.message 
    }, { status: 500 });
  }
}