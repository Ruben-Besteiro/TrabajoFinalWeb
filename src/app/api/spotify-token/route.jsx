import { generateCodeVerifier, generateCodeChallenge } from "../../../lib/auth";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = process.env.SPOTIFY_SCOPES;

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  // Codificamos el verifier en para luego pasarlo (si quiere funcionar)
  const state = Buffer.from(JSON.stringify({ verifier })).toString("base64");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: scopes,
    state: state, // Pasamos el verifier aquí
  });

  const spotifyUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: spotifyUrl,
    },
  });
}