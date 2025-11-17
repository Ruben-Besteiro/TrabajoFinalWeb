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
            <h1>About Us</h1>
            <p>We are a company that values...</p>
        </div>
    );
}