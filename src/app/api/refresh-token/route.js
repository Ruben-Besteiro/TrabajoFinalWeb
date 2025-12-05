import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      })
    });

    const data = await res.json();

    if (data.error || !data.access_token) {
      return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
    }

    const response = NextResponse.json({ 
      ok: true,
      access_token: data.access_token // Devolvemos el token
    });

    // Actualizamos la cookie
    response.cookies.set("access_token", data.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    // Cuando recibimos un nuevo refresh token, lo actualizamos
    if (data.refresh_token) {
      response.cookies.set("refresh_token", data.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
    }

    return response;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}