"use client"
import Link from "next/link";
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button onClick={() => {router.push("/")}}>Botón</button>
      {/*<Link href="/">Go back to Home</Link>*/}
    </div>
  );
}