"use client";

import React from "react";
import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { Barge } from "@/types/barge";

export interface BargeContextType {
  barge?: Barge[];
  isError?: unknown;
  isLoading: boolean;
  selectedBarge?: Barge;
  getById?: (id: string) => Promise<void>;
}

export const BargeContext = createContext<BargeContextType>({ isLoading: true });

export function BargeProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const [selectedBarge, setSelectedTugboat] = useState<Barge>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Barge[]>({
    queryKey: ["barges"],
    queryFn: async (): Promise<Barge[]> => {
      const response = await axios.get<Barge[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges`);
      return response.data;
    },
  });

  const getById = async (id: string): Promise<void> => {
    const cached = queryClient.getQueryData<Barge[]>(["barges"])?.find((t) => t.id === id);
    if (cached) {
      setSelectedTugboat(cached);
      return;
    }

    const res = await axios.get<Barge>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges/${id}`);
    setSelectedTugboat(res.data);
  };

  if (!data) return null;

  return (
    <BargeContext.Provider
      value={{
        barge: data,
        isLoading,
        getById,
        selectedBarge
      }}
    >
      {children}
    </BargeContext.Provider>
  );
}
