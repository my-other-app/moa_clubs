//layout.tsx
import "@/app/styles/globals.css"
import Providers from "./providers";
import { Suspense } from "react";
import { Bebas_Neue, DM_Sans } from "next/font/google";

// Configure Bebas Neue for headings
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

// Configure DM Sans for body text
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "My Other App",
  description: "Nextjs + TypeScript MyOtherAPP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>

            {children}

          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
