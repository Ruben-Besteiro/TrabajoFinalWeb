// src/app/dashboard/page.jsx
import { cookies } from "next/headers";
import { router } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    router.push("/");
  }

  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    router.push("/");
  }

  const user = await userResponse.json();

  // La parte del cliente debe ir en otro componente y meterle "use client"
  return <DashboardClient user={user} />;
}