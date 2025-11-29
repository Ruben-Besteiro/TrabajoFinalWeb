// API route para buscar artistas en Spotify
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
    return NextResponse.json({ error: "Query requerido" }, { status: 400 });
  }

  try {
    const searchUrl = `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(query)}&limit=20`;
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    return NextResponse.json({ 
      artists: data.artists?.items || [] 
    });
  } catch (error) {
    console.error("Error buscando artistas:", error);
    return NextResponse.json(
      { error: "Error buscando artistas" },
      { status: 500 }
    );
  }
}