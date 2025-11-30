import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: "ID de artista requerido" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({ tracks: data.tracks || [] });
  } catch (error) {
    console.error('Error obteniendo top tracks:', error);
    return NextResponse.json({ error: "Error en la API" }, { status: 500 });
  }
}