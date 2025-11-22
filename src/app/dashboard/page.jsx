import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Cancion from "../../components/Cancion";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    redirect("/");
  }

  const user = await userResponse.json();

  // Hacemos una búsqueda fija
  const searchUrl = "https://api.spotify.com/v1/search?type=track&q=";
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
      <h2 style={{ marginTop: "2rem" }}>Resultados</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map((track) => (
          <Cancion
            key={track.id}
            artista={track.artists.map((a) => a.name).join(", ")}
            nombre={track.name}
            imagen={track.album.images?.[2]?.url}
          />
        ))}
      </ul>
    </main>
  );
}