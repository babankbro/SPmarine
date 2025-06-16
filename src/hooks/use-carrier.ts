"use client";

import { useContext } from "react";
import { CarrierContext } from "@/contexts/carrier-context";
import type { CarrierContextType } from "@/contexts/carrier-context";

export function useCarrier(): CarrierContextType {
  const context = useContext<CarrierContextType>(CarrierContext);
  
  if (!context.carrier) {
    throw new Error("useCarrier must be used within a CarrierProvider");
  }
  
  return context;
}