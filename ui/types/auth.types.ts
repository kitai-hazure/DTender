import React from "react";
import { AuthState } from "@polybase/auth";

export interface IAuthContextProps {
  signIn: () => void;
  authState: AuthState;
}
export interface AuthProviderProps {
  children: React.ReactNode;
}
