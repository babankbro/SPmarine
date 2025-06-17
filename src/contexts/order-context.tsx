"use client";

import { createContext, ReactNode, useState } from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Order } from "@/types/order";

export interface OrderContextType {
	data?: Order[];
	isError?: unknown;
	isLoading: boolean;
	selected?: Order;
	getById?: (id: string) => Promise<void>;
}

export interface OrderProvidrProps {}

export const OrderContext = createContext<OrderContextType>({ isLoading: true });

export function OrderProvider({ children }: { children: ReactNode }) {
	const [selected, setSelected] = useState<Order>();
	const queryClient = new QueryClient();

	const { data, isLoading } = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: async () => {
			// return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders`)).data;
			return (await axios.get(`http://62.72.30.12:18001/v1/orders`)).data;
		},
	});

	const getById = async (id: string) => {
		const cached = queryClient.getQueryData<Order[]>(["tugboats"])?.find((t) => t.id === id);
		if (cached) {
			setSelected(cached);
			return;
		}

		const res = await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats/${id}`);
		setSelected(res.data);
	};

	if (!data) return <></>;

	return (
		<OrderContext.Provider
			value={{
				data: data,
				isLoading: isLoading,
				selected: selected,
				getById: getById,
			}}
		>
			{children}
		</OrderContext.Provider>
	);
}
