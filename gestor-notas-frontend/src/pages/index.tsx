import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../app/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/notes");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return null;
}
