"use-client";
import { Roboto } from "next/font/google";
const roboto = Roboto({
    weight: ["100", "300", "400", "500", "700", "900"],
    subsets: ["latin"],
    variable: "--font-roboto",
});

export default function About() {
    return (
        <div className={`${roboto.variable} font-sans`}>
            <h1>Esta página fue hecha por Rubén Besteiro Gómez</h1>
            <h1 className="text-3xl font-bold underline text-green-500 hover:text-green-300">Tailwind</h1>
        </div>
    );
}