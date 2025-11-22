export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!state) {
      return new Response("Missing state parameter", { status: 400 });
    }

    // Decodificar el verifier desde state
    let verifier;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      verifier = decoded.verifier;
    } catch (e) {
      return new Response("Invalid state parameter", { status: 400 });
    }

    if (!verifier) {
      return new Response("Missing verifier in state", { status: 400 });
    }

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

    if (data.error) {
      return new Response(
        `Error de Spotify: ${data.error} - ${data.error_description}`,
        { status: 400 }
      );
    }

    const response = new Response(
      `<html><body>Redirigiendo…</body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" }
      }
    );

    response.headers.append(
      "Set-Cookie",
      `access_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
    response.headers.append(
      "Set-Cookie",
      `refresh_token=${data.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
    response.headers.set("Refresh", "0; url=/dashboard");

    return response;
  } catch (error) {
    console.error("Error en callback:", error);
    return new Response(`Error interno: ${error.message}`, { status: 500 });
  }
}