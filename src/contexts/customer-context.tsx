"use client";

import { createContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Customer } from "@/types/customer";

export interface CustomerContextType {
	customer?: Customer[];
	isError?: unknown;
	isLoading: boolean;
}

export interface CustomerProvidrProps {}

export const CustomerContext = createContext<CustomerContextType>({ isLoading: true });

export function CustomerProvider({ children }: { children: ReactNode }) {
	const { data, isLoading } = useQuery<Customer[]>({
		queryKey: ["customers"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/customers`)).data;
			//return (await axios.get(`http://62.72.30.12:18001/v1/customers`)).data;
		},
	});

	if (!data) return <></>;

	return (
		<CustomerContext.Provider value={{ customer: data, isLoading: isLoading }}>{children}</CustomerContext.Provider>
	);
}