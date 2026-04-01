"use client";

import { useEffect, useRef } from "react";


export function VisitNotifier() {
  const sent = useRef(false);

  useEffect(() => {
    sent.current = false;

    const send = () => {
      if (sent.current) return;
      sent.current = true;

      const payload = {
        kind: "visit" as const,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        screenWidth: typeof window !== "undefined" ? window.screen.width : 0,
        screenHeight: typeof window !== "undefined" ? window.screen.height : 0,
        language: typeof navigator !== "undefined" ? navigator.language : "",
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer
            : "Direct",
        url: typeof window !== "undefined" ? window.location.href : "",
        timeZone:
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "",
        localTime:
          typeof window !== "undefined" ? new Date().toLocaleString() : "",
      };

      void fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    };

    const onInteract = () => {
      send();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };

    window.addEventListener("pointerdown", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);

    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  return null;
}
