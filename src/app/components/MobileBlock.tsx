import { useEffect, useState } from "react";

const MobileBlock = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileDevice = window.innerWidth < 768;
      console.log("Screen width:", window.innerWidth, "Mobile:", isMobileDevice);
      setIsMobile(isMobileDevice);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isMobile) return null; // Don't render if not mobile

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white text-center p-4 z-50">
      <h1 className="text-lg font-bold">This website is not supported on mobile devices.</h1>
    </div>
  );
};

export default MobileBlock;
