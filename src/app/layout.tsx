import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Inventory Porto",
    description: "Sistem manajemen inventaris warehouse",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body>{children}</body>
        </html>
    );
}
