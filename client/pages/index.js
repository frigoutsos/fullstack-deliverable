"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // Route user to the dashboard page from the root page /
  // If they are unauthenticated dashboard will route them to the login page
  useEffect(() => {
    router.replace("/dashboard");
  }, []);
};
