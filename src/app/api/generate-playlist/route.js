// API route para generar la playlist cuando le damos al botón
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { genres } = await request.json();

  let allTracks = [];

  // De momento solo buscamos por géneros porque es lo único que está implementado
  for (const genre of genres) {
    const searchUrl = `https://api.spotify.com/v1/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=10`;
    
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

  // Eliminar duplicados por ID
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  );

  return NextResponse.json({ tracks: uniqueTracks });
}