"use client";
import "antd/dist/reset.css";
import "@/styles/globals.css";
import React, { useContext, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { useContractEvent } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import DTenderJSON from "@/contracts/DTender.json";
import Moralis from "moralis";
import { Modal } from "antd";
// import { Polybase } from "@polybase/client"

// const db = new Polybase({
//   defaultNamespace: "pk/0x08965f78c6a549905b66896f5a44b3a3ac27cdd9759057d534a0b9a5bcdf7cb9aa852288826e01a7034716a2f98252500a8e480a40a2be9b6a7cc1df2f4fd9f1/DTender",
// });

// DISABLED THE SSR FOR THE LAYOUT TO REMOVE THE HYDRATION ERROR
const CustomLayout = dynamic(
  () => import("@/components/Layout").then((mod) => mod.default),
  { ssr: false }
);
export default function App({ Component, pageProps }: AppProps) {
  const [verificationEvent, setVerificationEvent] = useState<any>(undefined);
  const { db } = useContext(AuthContext);
  const { chains, provider } = configureChains(
    [polygonMumbai],
    [publicProvider()]
  );

  const wagmiClient = createClient({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    provider,
  });

  useContractEvent({
    address: `0x5c876A33570B1202Caf2892ce3D6F53c6c40bEC0`,
    abi: DTenderJSON.abi,
    eventName: "ProofSubmitted",
    listener: (event) => {
      console.log("EVENT: ", event);
      setVerificationEvent(event);
    },
  });

  useEffect(() => {
    const startMoralis = async () => {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
    };
    console.log("Moralis Called");
    if (!Moralis.Core.isStarted) startMoralis();
  }, []);

  console.log("wagmiClient: ", wagmiClient);

  const onVerificationOk = async () => {
    setVerificationEvent(undefined);
    // polybase addition
    await db!
      .collection("VerifiedCompany")
      .create([
        localStorage.getItem("walletAddress") as string,
        localStorage.getItem("walletAddress") as string,
      ]);
  };
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Modal
          title="Verification Successful"
          open={verificationEvent !== undefined}
          onOk={onVerificationOk}
          onCancel={() => setVerificationEvent(undefined)}
        >
          You have been successfully verified using the polygon ID zkp proof.
          Hell yeah!!!!
        </Modal>
        <AuthProvider>
          <CustomLayout>
            <Component {...pageProps} />
          </CustomLayout>
        </AuthProvider>
      </WagmiConfig>
    </>
  );
}
