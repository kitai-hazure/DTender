import React, { memo, useEffect, useMemo } from "react";
import { Polybase } from "@polybase/client";
import { ethPersonalSign } from "@polybase/eth";
import { Auth, AuthState } from "@polybase/auth";
import { IAuthContextProps, AuthProviderProps } from "@/types/auth.types";
import { configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import DTenderContract from "@/contracts/DTender.json";
import { Contract, ethers } from "ethers";
import { POLYGON_MUMBAI_ADDRESS } from "@/utils/constants";

const auth = typeof window !== "undefined" ? new Auth() : null;
const db = new Polybase({
  defaultNamespace:
    "pk/0x08965f78c6a549905b66896f5a44b3a3ac27cdd9759057d534a0b9a5bcdf7cb9aa852288826e01a7034716a2f98252500a8e480a40a2be9b6a7cc1df2f4fd9f1/DTender",
});

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
  contract: undefined,
  db: undefined,
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
  const [contract, setContract] = React.useState<Contract>();

  const signIn = async () => {
    const authState = await auth?.signIn();
    if (typeof window !== "undefined") {
      localStorage.setItem("walletAddress", JSON.stringify(authState?.userId));
    }
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
    setProvider(provider);
    if (authState?.userId) {
      setIsSignedInMetamask(true);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      console.log("signer: ", signer);
      setSigner(signer);
      setContract(
        new ethers.Contract(POLYGON_MUMBAI_ADDRESS, DTenderContract.abi, signer)
      );
    }
  };

  const signOut = async () => {
    await auth?.signOut();
    setIsSignedInMetamask(false);
    setSigner(undefined);
    setIsCompany(false);
    setSelectedOption(false);
    localStorage.clear();
  };

  const setCompany = (isCompany: boolean) => {
    setIsCompany(isCompany);
    localStorage.setItem("isCompany", JSON.stringify(isCompany));
  };

  const setOptionToTrue = () => {
    setSelectedOption(true);
  };

  useEffect(() => {
    signIn();
    const isCompany = localStorage.getItem("isCompany");
    if (isCompany) setIsCompany(JSON.parse(isCompany));
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
        contract,
        db,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
