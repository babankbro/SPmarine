"use client";

import { createContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Station } from "@/types/station";

export interface StationContextType {
	station?: Station[];
	isError?: unknown;
	isLoading: boolean;
}

export interface StationProvidrProps {}

export const StationContext = createContext<StationContextType>({ isLoading: true });

export function StationProvider({ children }: { children: ReactNode }) {
	const { data, isLoading } = useQuery<Station[]>({
		queryKey: ["stations"],
		queryFn: async () => {
			// return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/stations`)).data;
			return (await axios.get(`http://62.72.30.12:18001/v1/stations`)).data;
		},
	});

	if (!data) return <></>;

	return <StationContext.Provider value={{ station: data, isLoading: isLoading }}>{children}</StationContext.Provider>;
}
