"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";
import { PlayDialog } from "./_components/PlayDialog";
import { Providers } from "@/app/lib/Providers";
import { existProfile } from "@/app/action";

function HeroHome() {
  const { address, isConnected } = useAccount();
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Redirect if not connected (runs on mount and when isConnected changes)
  useEffect(() => {
    if (!isConnected) {
      redirect("/");
    }
  }, [isConnected]);

  // Load user profile when address changes
  useEffect(() => {
    if (!address) {
      setUserName(null);
      setError(null);
      return;
    }

    const loadUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await existProfile(address);
        setUserName(user ? user.username : null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setError("Failed to load profile");
        setUserName(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [address]);

  const handleRedirection = useCallback(() => {
    if (userName && !isLoading && !error) {
      redirect("/playground");
    }
  }, [userName, isLoading, error]);

  if (error) {
    return (
      <div className="p-0">
        <Providers>
          <section className="h-screen w-screen flex items-center justify-center text-white bg-black">
            <div className="text-center">
              <p className="text-xl mb-4">Error loading profile</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Retry
              </button>
            </div>
          </section>
        </Providers>
      </div>
    );
  }

  return (
    <div className="p-0">
      <Providers>
        <section className="h-screen w-screen flex flex-col items-center justify-between text-white overflow-hidden max-w-7xl mx-auto">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/background.jpg"
              alt="Vibrant abstract background image"
              fill
              style={{ objectFit: "cover" }}
              sizes="100vw"
              priority
            />
          </div>
          <div className="relative z-20 text-center max-w-4xl p-6 md:p-12 pt-20 flex flex-col items-center justify-center grow">
            <button
              onClick={handleRedirection}
              disabled={isLoading || !userName}
              className="text-5xl sm:text-7xl font-extrabold mb-6 leading-snug bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enter Playground"
            >
              <PlayDialog />
              <br className="sm:hidden" />
            </button>
          </div>
        </section>
      </Providers>
    </div>
  );
}

export default HeroHome;
