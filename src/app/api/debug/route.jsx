export async function GET() {
  return Response.json({
    client: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    redirect: process.env.SPOTIFY_REDIRECT_URI,
    scopes: process.env.SPOTIFY_SCOPES,
  });
}