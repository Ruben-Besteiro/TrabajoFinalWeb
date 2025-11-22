"use client";

export default function Home() {
  const login = () => {
    window.location.href = "/api/spotify-token";
  };

  return (
    <main>
      <h1>Spotify Taste Mixer</h1>
      <button onClick={login}>Conectar con Spotify</button>
    </main>
  );
}
