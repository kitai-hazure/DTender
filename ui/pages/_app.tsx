"use client";
import "antd/dist/reset.css";
import "@/styles/globals.css";
import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Moralis from "moralis";

// DISABLED THE SSR FOR THE LAYOUT TO REMOVE THE HYDRATION ERROR
const CustomLayout = dynamic(
  () => import("@/components/Layout").then((mod) => mod.default),
  { ssr: false }
);
export default function App({ Component, pageProps }: AppProps) {
  const { chains, provider } = configureChains(
    [polygonMumbai],
    [publicProvider()]
  );

  const wagmiClient = createClient({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    provider,
  });

  useEffect(() => {
    const startMoralis = async () => {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
    };
    if (!Moralis.Core.isStarted) startMoralis();
  }, []);

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <AuthProvider>
          <CustomLayout>
            <Component {...pageProps} />
          </CustomLayout>
        </AuthProvider>
      </WagmiConfig>
    </>
  );
}
