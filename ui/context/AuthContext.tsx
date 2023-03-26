import React, { memo, useEffect, useMemo } from "react";
import { Polybase } from "@polybase/client";
import { ethPersonalSign } from "@polybase/eth";
import { Auth, AuthState } from "@polybase/auth";
import { IAuthContextProps, AuthProviderProps } from "@/types/auth.types";
import { configureChains, useAccount, useConnect } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import { ethers } from "ethers";

const auth = typeof window !== "undefined" ? new Auth() : null;
const db = new Polybase();

db.signer((data) => {
  return {
    h: "eth-personal-sign",
    sig: ethPersonalSign(process.env.NEXT_PUBLIC_PRIVATE_KEY as string, data),
  };
});

export const AuthContext = React.createContext<IAuthContextProps>({
  signIn: () => {},
  signOut: () => {},
  isSignedInMetamask: false,
  authState: {} as AuthState,
  isCompany: false,
  selectedOption: false,
  setCompany: () => {},
  setOptionToTrue: () => {},
  signer: undefined,
});

const { chains, provider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = React.useState<any>(null);
  const [selectedOption, setSelectedOption] = React.useState<boolean>(false);
  const [isCompany, setIsCompany] = React.useState(false);
  const [isSignedInMetamask, setIsSignedInMetamask] = React.useState(false);
  const [provider, setProvider] = React.useState<any>(null);
  const [signer, setSigner] = React.useState<ethers.providers.JsonRpcSigner>();

  const signIn = async () => {
    const authState = await auth?.signIn();
    if (typeof window !== "undefined") {
      localStorage.setItem("walletAddress", JSON.stringify(authState?.userId));
    }
    setIsSignedInMetamask(true);
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
    setProvider(provider);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("signer: ", signer);
    setSigner(signer);
  };

  const signOut = async () => {
    await auth?.signOut();
    setIsSignedInMetamask(false);
  };

  const setCompany = (isCompany: boolean) => {
    setIsCompany(isCompany);
    localStorage.setItem("isCompany", JSON.stringify(isCompany));
  };

  const setOptionToTrue = () => {
    setSelectedOption(true);
  };

  useEffect(() => {
    const isCompany = localStorage.getItem("isCompany");
    if (isCompany) setIsCompany(JSON.parse(isCompany));
    signIn();
  }, []);

  useMemo(() => {
    auth?.onAuthUpdate((authStatee) => {
      if (!authState) {
        setAuthState(authStatee);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        authState,
        isCompany,
        selectedOption,
        setCompany,
        setOptionToTrue,
        isSignedInMetamask,
        signer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
