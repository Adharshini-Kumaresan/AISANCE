import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "AISANCE — Cognitive Comfort Intelligence Platform",
  description:
    "AISANCE is not a suspension system. It is a cognitive layer over motion — sensing road inputs, predicting discomfort, and adapting before impact.",
  keywords: ["AISANCE", "cognitive comfort", "intelligent suspension", "automotive", "AI ride comfort"],
  openGraph: {
    title: "AISANCE — Cognitive Comfort Intelligence",
    description: "The road never changes. Only the system does.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: '#050505' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#050505', margin: 0, padding: 0 }}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}

