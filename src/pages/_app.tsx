import { type AppType } from "next/app";
import { useState, useEffect } from "react";
import "./styles.css";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import { useRouter } from "next/router";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window != "undefined") {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      {isLoading ? (
        <div className="flex h-full w-full items-center"> Loading... </div>
      ) : (
        <Component {...pageProps} />
      )}
    </div>
  );
};

export default trpc.withTRPC(MyApp);
