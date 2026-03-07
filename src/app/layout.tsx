import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "HealthBook | Premium Healthcare Booking",
    description: "Find the right specialist near you and book an appointment instantly.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} antialiased min-h-screen bg-gray-50/50`}>
                {children}
            </body>
        </html>
    );
}
