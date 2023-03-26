import React from "react";
import { AuthState } from "@polybase/auth";
import { ethers } from "ethers";

export interface IAuthContextProps {
  signIn: () => void;
  signOut: () => void;
  isSignedInMetamask: boolean;
  authState: AuthState;
  isCompany: boolean;
  selectedOption: boolean;
  setCompany: (value: boolean) => void;
  setOptionToTrue: () => void;
  signer: ethers.providers.JsonRpcSigner | undefined;
}
export interface AuthProviderProps {
  children: React.ReactNode;
}
