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
            <h1>Esta página fue hecha por el grandísimo Untar la Manteca</h1>
            <h1>también conocido como Rubén Besteiro</h1>
        </div>
    );
}