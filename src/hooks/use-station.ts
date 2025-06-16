"use client";

import { useContext } from "react";
import { StationContext } from "@/contexts/station-context";
import type { StationContextType } from "@/contexts/station-context";

export function useStation(): StationContextType {
  const context = useContext<StationContextType>(StationContext);
  
  if (!context.station) {
    throw new Error("useStation must be used within a StationProvider");
  }
  
  return context;
}