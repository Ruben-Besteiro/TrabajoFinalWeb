import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

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

  //const data = await resp.json();
  const txt = await resp.text();

  console.log("Spotify respondió con:", txt);

  let data;
  try {
    data = JSON.parse(txt);
  } catch {
    data = { error: "invalid_json", raw: txt };
  }

  // Crear la respuesta
  const response = new Response("Redirigiendo...", { status: 302 });

  response.headers.set("Location", "/dashboard");

  // Cookies HttpOnly
  response.headers.append(
    "Set-Cookie",
    `access_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  response.headers.append(
    "Set-Cookie",
    `refresh_token=${data.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  return response;
}