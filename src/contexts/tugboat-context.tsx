"use client";

import { createContext, ReactNode, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Tugboat } from "@/types/tugboat";

export interface TugboatContextType {
	tugboat?: Tugboat[];
	isError?: unknown;
	isLoading: boolean;
	selectedTugboat?: Tugboat;
	getById?: (id: string) => Promise<void>;
}

export interface TugboatProvidrProps {}

export const TugboatContext = createContext<TugboatContextType>({ isLoading: true });

export function TugboatProvider({ children }: { children: ReactNode }) {
	const [selectedTugboat, setSelectedTugboat] = useState<Tugboat>();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<Tugboat[]>({
		queryKey: ["tugboats"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats`)).data;
		},
	});

	const getById = async (id: string) => {
		const cached = queryClient.getQueryData<Tugboat[]>(["tugboats"])?.find((t) => t.id === id);
		if (cached) {
			setSelectedTugboat(cached);
			return;
		}

		const res = await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats/${id}`);
		setSelectedTugboat(res.data);
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
