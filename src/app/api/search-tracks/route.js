import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Falta query" }, { status: 400 });
  }

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

    const data = await response.json();
    if (data.tracks?.items) {
      allTracks = [...allTracks, ...data.tracks.items];
    }
  }

  // Eliminar duplicados
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  );

  return NextResponse.json({ tracks: uniqueTracks });
}