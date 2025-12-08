import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar.jsx'

const roboto = Roboto({
    weight: ["100", "300", "400", "500", "700", "900"],
    subsets: ["latin"],
    variable: "--font-roboto",
});

export const metadata = {
  title: "Spotify Taste Mixer",
  description: "Crea playlists personalizadas para añadirlas a Sporigy",
  keywords: ["spotify", "music", "playlist", "mixer"],
};

// Este layout como le pertenece al app y es RootLayout entonces está en todo

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={roboto.className}>
        {/* Aquí van los componentes que se renderizan por encima de todo lo demás */}
        <Navbar/>

        {/* Aquí se renderiza cada página */}
        <main>
          {children}
        </main>

        {/* Y si hubiese un componente que se renderizase por debajo de todo, iría aquí */}
      </body>
    </html>
  );
}