import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 bg-green-950 text-white flex gap-4">
      <Link href="/">Inicio</Link>
      <Link href="/about">Sobre mí</Link>
      <Link href="/contact">Contacto</Link>
    </nav>
  );
}