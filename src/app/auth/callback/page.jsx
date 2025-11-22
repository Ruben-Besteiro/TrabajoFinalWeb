import { cookies } from "next/headers";

export default async function Callback({ searchParams }) {
  const code = searchParams.code;
  const verifier = cookies().get("verifier")?.value;

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      code_verifier: verifier
    })
  });

  const data = await resp.json();

  // Guardar access y refresh tokens
  const response = new Response(`
    <html><body>Redirigiendo...</body></html>
  `, { status: 200 });

  response.headers.set(
    "Set-Cookie",
    `access_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  response.headers.append(
    "Set-Cookie",
    `refresh_token=${data.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  response.headers.set("Refresh", "0; url=/dashboard");

  return response;
}
