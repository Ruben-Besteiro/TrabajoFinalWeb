// API route que llamamos desde el widget de géneros para obtener los géneros
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("=== Inicio /api/genres ===");
  
  try {
    const cookieStore = await cookies();
    console.log("Cookies obtenidas");
    
    const accessToken = cookieStore.get("access_token")?.value;
    console.log("Access token existe:", !!accessToken);

    if (!accessToken) {
      console.log("No hay access token");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    console.log("Haciendo fetch a Spotify...");
    const response = await fetch(
      "https://api.spotify.com/v1/recommendations/available-genre-seeds",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Respuesta de Spotify:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de Spotify:", errorData);
      return NextResponse.json(
        { error: "Error obteniendo géneros de Spotify" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Géneros obtenidos:", data.genres?.length);
    console.log("=== Fin /api/genres ===");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERROR CAPTURADO en /api/genres:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}