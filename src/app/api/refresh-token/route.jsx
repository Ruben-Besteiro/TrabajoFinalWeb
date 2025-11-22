import { NextResponse } from "next/server";

export async function GET(request) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

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

  const response = NextResponse.json({ ok: true });

  if (data.access_token) {
    response.headers.set(
      "Set-Cookie",
      `access_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
  }

  if (data.refresh_token) {
    response.headers.append(
      "Set-Cookie",
      `refresh_token=${data.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
  }

  return response;
}
