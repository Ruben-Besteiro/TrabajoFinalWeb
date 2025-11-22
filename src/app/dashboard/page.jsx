import { cookies } from "next/headers";
import { getProfile } from "../../lib/spotify";

export default async function Dashboard() {
  const token = cookies().get("access_token")?.value;

  if (!token) return <p>No autenticado</p>;

  const profile = await getProfile(token);

  return (
    <main>
      <h1>Bienvenido {profile.display_name}</h1>
      <img src={profile.images?.[0]?.url} width={100} />
    </main>
  );
}
