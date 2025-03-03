import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};

export default Layout;
