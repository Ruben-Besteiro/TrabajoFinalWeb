// API route para generar la playlist cuando le damos al botón
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { genres, years } = await request.json();
  let allTracks = [];

  // Buscamos por géneros
  for (const genre of genres) {
    const searchUrl = `https://api.spotify.com/v1/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=9999999999999999999999999999999999999999999999999`;
    
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

  // Los resultados de la llamada a la API los filtramos por año
  if (years) {
    allTracks = allTracks.filter(track => {
      if (!track.album?.release_date) return false;
      const trackYear = parseInt(track.album.release_date.substring(0, 4));
      return (trackYear >= years[0] && trackYear <= years[1]);
    });
  }

  // Eliminar duplicados por ID
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  );

  return NextResponse.json({ tracks: uniqueTracks });
}