"use client";

import { useEffect } from "react";

/** Removes the SSR boot banner once client JS hydrates. */
export function HydrationGuard() {
  useEffect(() => {
    document.getElementById("aligncv-boot")?.remove();
  }, []);

  return null;
}
