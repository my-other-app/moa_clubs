"use client"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function UnsupportedPage() {
        return (
         
            <div className="flex items-center justify-center min-h-screen bg-black p-3">
                <div className="bg-black rounded-xl py-16 px-3 w-auto border-white border border-solid">
                        <h1 className="text-4xl text-white font-bold text-center bebas">
                        WELCOME TO MYOTHERAPP
                        </h1>
                        <div style={{ filter: "hue-rotate(0deg) saturate(10) brightness(1)" }}>
                                <DotLottieReact
                                src="https://lottie.host/b271a2d5-4d44-41bd-8cf7-39feb01887cf/kUKz6TEv8I.lottie"
                                loop
                                autoplay
                                />
                                </div>
                        <p className="text-white text-center">
                        Our website is not supported on mobile devices.
                        </p>

                </div>
                </div>
 
        );
      }
      