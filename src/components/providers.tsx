"use client";

import { MotionConfig } from "motion/react";

/** Respect the OS "reduce motion" setting for all animations. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
