"use client";

import { useContext } from "react";

import { StationContext, StationContextType } from "@/contexts/station-context";

export function useStation() {
  const { station } = useContext<StationContextType>(StationContext);
  if (!station) {
    throw new Error("useTugboat must be used within a TugboatProvider");
  }

  return station;
}