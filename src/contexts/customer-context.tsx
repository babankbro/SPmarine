"use client";

import React from "react";
import { createContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Customer } from "@/types/customer";

export interface CustomerContextType {
  customer?: Customer[];
  isError?: unknown;
  isLoading: boolean;
}

export const CustomerContext = createContext<CustomerContextType>({ isLoading: true });

export function CustomerProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const { data, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const response = await axios.get<Customer[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/customers`);
      return response.data;
    },
  });

  if (!data) return null;

  return (
    <CustomerContext.Provider
      value={{
        customer: data,
        isLoading
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}
