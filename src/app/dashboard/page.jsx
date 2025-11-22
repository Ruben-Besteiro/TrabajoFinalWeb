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

  return (
    <main style={{ padding: "2rem" }}>
      <h1>¡Bienvenido, {user.display_name}!</h1>
      <p>Email: {user.email}</p>
      {user.images?.[0] && (
        <img 
          src={user.images[0].url} 
          alt="Foto de perfil" 
          style={{ borderRadius: "50%", width: "100px" }}
        />
      )}
      <p>La autenticación con Spotify funciona!!!!!!</p>
    </main>
  );
}