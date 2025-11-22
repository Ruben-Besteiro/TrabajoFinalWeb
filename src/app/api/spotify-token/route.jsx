import { NextResponse } from "next/server";
import { generateCodeVerifier, generateCodeChallenge } from "../../../lib/auth";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = process.env.SPOTIFY_SCOPES;

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: scopes,
  });

  const res = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );

  res.cookies.set("verifier", verifier, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "none",
    maxAge: 600,
  });

  return res;
}