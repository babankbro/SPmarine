"use client";

import { createContext, ReactNode, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Barge } from "@/types/barge";

export interface BargeContextType {
	barge?: Barge[];
	isError?: unknown;
	isLoading: boolean;
	selectedBarge?: Barge;
	getById?: (id: string) => Promise<void>;
}

export interface BargeProvidrProps {}

export const BargeContext = createContext<BargeContextType>({ isLoading: true });

export function BargeProvider({ children }: { children: ReactNode }) {
	const [selectedBarge, setSelectedTugboat] = useState<Barge>();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<Barge[]>({
		queryKey: ["barges"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges`)).data;
		},
	});

	const getById = async (id: string) => {
		const cached = queryClient.getQueryData<Barge[]>(["barges"])?.find((t) => t.id === id);
		if (cached) {
			setSelectedTugboat(cached);
			return;
		}

		const res = await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges/${id}`);
		setSelectedTugboat(res.data);
	};

	if (!data) return <></>;

	return (
		<BargeContext.Provider
			value={{
				barge: data,
				isLoading: isLoading,
				getById: getById,
				selectedBarge: selectedBarge,
			}}
		>
			{children}
		</BargeContext.Provider>
	);
}
