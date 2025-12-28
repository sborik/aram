import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "A-RAM | Official",
    description: "A-RAM - Official website. Immersive music experience.",
    metadataBase: new URL("https://aram.band"),
    openGraph: {
        title: "A-RAM | Official",
        description: "A-RAM - Official website. Immersive music experience.",
        url: "https://aram.band",
        siteName: "A-RAM",
        type: "website",
        images: [
            {
                url: "/images/a-ram-web-pic.jpeg",
                width: 1024,
                height: 1024,
                alt: "A-RAM",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "A-RAM | Official",
        description: "A-RAM - Official website. Immersive music experience.",
        images: ["/images/a-ram-web-pic.jpeg"],
    },
    icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
