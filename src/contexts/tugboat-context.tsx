"use client";

import React from "react";
import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { Tugboat } from "@/types/tugboat";

export interface TugboatContextType {
  tugboat?: Tugboat[];
  isError?: unknown;
  isLoading: boolean;
  selectedTugboat?: Tugboat;
  getById: (id: string) => Tugboat | undefined;
}

export const TugboatContext = createContext<TugboatContextType>({ 
  isLoading: true, 
  getById: () => undefined 
});

export function useTugboat(): TugboatContextType & { getById: (id: string) => Tugboat | undefined } {
  const context = useContext(TugboatContext);
  
  if (context === undefined) {
      throw new Error('useTugboat must be used within a TugboatProvider');
  }
  
  return {
    ...context,
    getById: (id: string): Tugboat | undefined => {
      return context.tugboat?.find(t => t.id === id);
    }
  };
}

export function TugboatProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const [selectedTugboat, setSelectedTugboat] = useState<Tugboat>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Tugboat[]>({
    queryKey: ["tugboats"],
    queryFn: async (): Promise<Tugboat[]> => {
      const response = await axios.get<Tugboat[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats`);
      return response.data;
    },
  });

  // This async function is not used directly in the component, but kept for future use
  const _getById = async (id: string): Promise<void> => {
    const cached = queryClient.getQueryData<Tugboat[]>(["tugboats"])?.find((t) => t.id === id);
    if (cached) {
      setSelectedTugboat(cached);
      return;
    }

    const res = await axios.get<Tugboat>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats/${id}`);
    setSelectedTugboat(res.data);
  };

  if (!data) return null;

  // Define a synchronous version of getById to match the interface
  const synchronousGetById = (id: string): Tugboat | undefined => {
    return data?.find(t => t.id === id);
  };

  return (
    <TugboatContext.Provider
      value={{
        tugboat: data,
        isLoading,
        getById: synchronousGetById,
        selectedTugboat
      }}
    >
      {children}
    </TugboatContext.Provider>
  );
}
