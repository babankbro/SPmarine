"use client";

import React from "react";
import { createContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Station } from "@/types/station";

export interface StationContextType {
  station?: Station[];
  isError?: unknown;
  isLoading: boolean;
}

export const StationContext = createContext<StationContextType>({ isLoading: true });

export function StationProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const { data, isLoading } = useQuery<Station[]>({
    queryKey: ["stations"],
    queryFn: async (): Promise<Station[]> => {
      const response = await axios.get<Station[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/stations`);
      return response.data;
    },
  });

  if (!data) return null;

  return (
    <StationContext.Provider
      value={{
        station: data,
        isLoading
      }}
    >
      {children}
    </StationContext.Provider>
  );
}