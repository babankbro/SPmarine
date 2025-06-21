"use client";

import { createContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Carrier } from "@/types/carrier";

export interface CarrierContextType {
	carrier?: Carrier[];
	isError?: unknown;
	isLoading: boolean;
}

export interface CarrierProvidrProps {}

export const CarrierContext = createContext<CarrierContextType>({ isLoading: true });

export function CarrierProvider({ children }: { children: ReactNode }) {
	const { data, isLoading } = useQuery<Carrier[]>({
		queryKey: ["carriers"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/carriers`)).data;
			//return (await axios.get(`http://62.72.30.12:18001/v1/carriers`)).data;
		},
	});

	if (!data) return <></>;

	return <CarrierContext.Provider value={{ carrier: data, isLoading: isLoading }}>{children}</CarrierContext.Provider>;
}
