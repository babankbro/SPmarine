"use client";

import React from "react";
import { createContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Carrier } from "@/types/carrier";

export interface CarrierContextType {
  carrier?: Carrier[];
  isError?: unknown;
  isLoading: boolean;
}

export const CarrierContext = createContext<CarrierContextType>({ isLoading: true });

export function CarrierProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const { data, isLoading } = useQuery<Carrier[]>({
    queryKey: ["carriers"],
    queryFn: async (): Promise<Carrier[]> => {
      const response = await axios.get<Carrier[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/carriers`);
      return response.data;
    },
  });

  if (!data) return null;

  return (
    <CarrierContext.Provider
      value={{
        carrier: data,
        isLoading
      }}
    >
      {children}
    </CarrierContext.Provider>
  );
}
