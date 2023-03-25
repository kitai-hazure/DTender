import React from "react";
import { AuthState } from "@polybase/auth";

export interface IAuthContextProps {
  signIn: () => void;
  signOut: () => void;
  authState: AuthState;
  isCompany: boolean;
  selectedOption: boolean;
  setCompany: (value: boolean) => void;
  setOptionToTrue: () => void;
}
export interface AuthProviderProps {
  children: React.ReactNode;
}
