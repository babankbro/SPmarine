// src/hooks/use-customer.ts
"use client";

import { useContext } from "react";
import { CustomerContext, CustomerContextType } from "@/contexts/customer-context";

export function useCustomer(): CustomerContextType {
  const context = useContext(CustomerContext);

  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }

  return context;
}