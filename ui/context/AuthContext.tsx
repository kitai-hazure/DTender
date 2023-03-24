import React from "react";
import { Polybase } from "@polybase/client";
import { ethPersonalSign } from "@polybase/eth";
import { Auth, AuthState } from "@polybase/auth";
import { IAuthContextProps, AuthProviderProps } from "@/types/auth.types";

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
  authState: {} as AuthState,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = React.useState<any>(null);

  const signIn = async () => {
    const authState = await auth?.signIn();
    if (typeof window !== "undefined") {
      localStorage.setItem("walletAddress", JSON.stringify(authState?.userId));
    }
  };

  auth?.onAuthUpdate((authStatee) => {
    if (!authState) {
      setAuthState(authStatee);
    }
  });

  return (
    <AuthContext.Provider value={{ signIn, authState }}>
      {children}
    </AuthContext.Provider>
  );
};
