"use client";

import { useContext } from "react";
import { TugboatContext } from "@/contexts/tugboat-context";
import type { TugboatContextType } from "@/contexts/tugboat-context";

export function useTugboat(): TugboatContextType {
  const context = useContext<TugboatContextType>(TugboatContext);
  
  if (!context.tugboat) {
    throw new Error("useTugboat must be used within a TugboatProvider");
  }
  
  return context;
}