import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "非上場株式評価シミュレーター",
  description: "取引相場のない株式の相続税評価額を試算します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@100;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased bg-background text-foreground`}>
        <main className="min-h-screen p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
