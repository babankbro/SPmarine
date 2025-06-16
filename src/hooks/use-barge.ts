"use client";

import { useContext } from "react";
import { BargeContext } from "@/contexts/barge-context";
import type { BargeContextType } from "@/contexts/barge-context";

export function useBarge(): BargeContextType {
  const context = useContext<BargeContextType>(BargeContext);
  
  if (!context.barge) {
    throw new Error("useBarge must be used within a BargeProvider");
  }
  
  return context;
}