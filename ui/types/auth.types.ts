import React from "react";
import { AuthState } from "@polybase/auth";
import { ethers } from "ethers";
import { Collection, Polybase } from "@polybase/client";

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
  contract: ethers.Contract | undefined;
  db: Polybase | undefined;
}
export interface AuthProviderProps {
  children: React.ReactNode;
}
