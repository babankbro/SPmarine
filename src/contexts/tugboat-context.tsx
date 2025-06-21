"use client";

import { createContext, ReactNode, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Tugboat } from "@/types/tugboat";
import { http } from "@/http";

export interface TugboatContextType {
	tugboat?: Tugboat[];
	isError?: unknown;
	isLoading: boolean;
	selectedTugboat?: Tugboat;
	getById?: (id: string) => Tugboat | undefined;
}

export interface TugboatProvidrProps {}

export const TugboatContext = createContext<TugboatContextType>({ isLoading: true });

export function TugboatProvider({ children }: { children: ReactNode }) {
	const [selectedTugboat, setSelectedTugboat] = useState<Tugboat>();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<Tugboat[]>({
		queryKey: ["tugboats"],
		queryFn: async () => {
			//return (await http.get<Tugboat[]>("tugboats")).data;
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats`)).data;
			//return (await axios.get(`http://62.72.30.12:18001/v1/tugboats`)).data;
		},
	});

	const getById = (id: string) => {
		return data?.find((tugboat: Tugboat) => tugboat.id === id);
	};

	if (!data) return <></>;

	return (
		<TugboatContext.Provider
			value={{
				tugboat: data,
				isLoading: isLoading,
				getById: getById,
				selectedTugboat: selectedTugboat,
			}}
		>
			{children}
		</TugboatContext.Provider>
	);
}
