import { AppProps } from "next/app";
import "../styles/globals.css";
import { AuthProvider } from "../app/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
