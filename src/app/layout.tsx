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
        <Providers>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        </Providers>
      </body>
    </html>
  );
}
