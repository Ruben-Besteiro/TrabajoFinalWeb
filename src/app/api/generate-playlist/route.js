// API route para generar la playlist cuando le damos al botón
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

  return NextResponse.json({ tracks: limitedTracks });
}