//layout.tsx
import "@/app/styles/globals.css"
import Providers from "./providers";
import { Suspense } from "react";

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
    <html lang="en">
      <body>
      <Suspense fallback={<div>Loading...</div>}>
        <Providers>
        
          {children}
        
        </Providers>
        </Suspense>
      </body>
    </html>
  );
}
