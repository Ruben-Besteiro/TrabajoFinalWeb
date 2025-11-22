import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  // Obtenemos los datos de mi cuenta
  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    redirect("/");
  }

  const user = await userResponse.json();

  // Búsqueda de canciones
  const searchUrl = "https://api.spotify.com/v1/search?type=track&q=bohemian%20rhapsody&limit=10";
  const searchResponse = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const searchData = await searchResponse.json();
  const tracks = searchData.tracks?.items || [];

  return (
    <main style={{ padding: "2rem" }}>
      <h1>¡Bienvenido, {user.display_name}!</h1>
      {user.images?.[0] && (
        <img 
          src={user.images[0].url} 
          alt="Foto de perfil" 
          style={{ borderRadius: "50%", width: "100px" }}
        />
      )}
      
      <h2 style={{ marginTop: "2rem" }}>Resultados para "Bohemian Rhapsody"</h2>
      
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map((track) => (
          <li 
            key={track.id} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              padding: "0.5rem 0",
              borderBottom: "1px solid #eee"
            }}
          >
            {track.album.images?.[2] && (
              <img 
                src={track.album.images[2].url} 
                alt={track.album.name}
                style={{ width: "50px", height: "50px" }}
              />
            )}
            <div>
              <strong>{track.name}</strong>
              <p style={{ margin: 0, color: "#666" }}>
                {track.artists.map(a => a.name).join(", ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}