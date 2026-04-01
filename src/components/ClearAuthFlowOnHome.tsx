"use client";

import { useEffect } from "react";
import { clearAuthFlow } from "@/lib/auth-flow";

export function ClearAuthFlowOnHome() {
  useEffect(() => {
    clearAuthFlow();
  }, []);
  return null;
}
