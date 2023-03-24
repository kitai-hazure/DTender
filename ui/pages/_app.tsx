import "antd/dist/reset.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";

// DISABLED THE SSR FOR THE LAYOUT TO REMOVE THE HYDRATION ERROR
const CustomLayout = dynamic(
  () => import("@/components/Layout").then((mod) => mod.default),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthProvider>
        <CustomLayout>
          <Component {...pageProps} />
        </CustomLayout>
      </AuthProvider>
    </>
  );
}
