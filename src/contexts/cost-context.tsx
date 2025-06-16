"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Cost } from "@/types/cost";
import { http } from "@/http";

interface CostContextType {
	costList: Cost[];
	isLoading: boolean;
	isError: boolean;
	getByIds: (tugboatId: string, orderId: string) => Cost | undefined;
	getCostsByTugboat: (tugboatId: string) => Cost[];
	getCostsByOrder: (orderId: string) => Cost[];
}

const CostContext = createContext<CostContextType | undefined>(undefined);

export function CostProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const {
		data: costList = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["costs"],
		queryFn: async () => {
			return (await http.get<Cost[]>("costs")).data;
			// return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/costs`)).data;
		},
	});

	const getByIds = (tugboatId: string, orderId: string) => {
		return costList.find((cost: Cost) => cost.tugboatId === tugboatId && cost.orderId === orderId);
	};

	const getCostsByTugboat = (tugboatId: string) => {
		return costList.filter((cost: Cost) => cost.tugboatId === tugboatId);
	};

	const getCostsByOrder = (orderId: string) => {
		return costList.filter((cost: Cost) => cost.orderId === orderId);
	};

	return (
		<CostContext.Provider
			value={{
				costList: costList,
				isLoading: isLoading,
				isError: isError,
				getByIds: getByIds,
				getCostsByTugboat: getCostsByTugboat,
				getCostsByOrder: getCostsByOrder,
			}}
		>
			{children}
		</CostContext.Provider>
	);
}

export function useCost() {
	const context = useContext(CostContext);

	if (context === undefined) {
		throw new Error("useCost must be used within a CostProvider");
	}

	return context;
}
