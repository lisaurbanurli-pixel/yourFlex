"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  hasLoginComplete,
  hasTwoFactorStepComplete,
  hasIdentityStepComplete,
} from "@/lib/auth-flow";

type Step = "two-factor" | "verify" | "identity" | "verify2";

export function AuthFlowGuard({
  step,
  children,
}: {
  step: Step;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasLoginComplete()) {
      router.replace("/");
      return;
    }

    if ((step === "verify" || step === "identity" || step === "verify2") && !hasTwoFactorStepComplete()) {
      router.replace("/two-factor");
      return;
    }

    if (step === "verify2" && !hasIdentityStepComplete()) {
      router.replace("/two-factor/verify");
      return;
    }

    setAllowed(true);
  }, [step, router]);

  if (!allowed) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24 text-sm text-[#666666]">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
