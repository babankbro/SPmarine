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
	deleteById?: (id: string) => Promise<void>;
    refetch?: () => void;
}

export interface OrderProvidrProps {}

export const OrderContext = createContext<OrderContextType>({ isLoading: true });

export function OrderProvider({ children }: { children: ReactNode }) {
	const [selected, setSelected] = useState<Order>();
	const queryClient = new QueryClient();

	const { 
		data, 
		isLoading, 
		refetch:queryRefetch  // <-- Add this
		} = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders`)).data;
		},
		});

	const getById = async (id: string) => {
		const cached = queryClient.getQueryData<Order[]>(["orders"])?.find((t) => t.id === id);
		if (cached) {
			setSelected(cached);
			return;
		}

		const res = await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders/${id}`);
		setSelected(res.data);
	};

	const deleteById = async (id: string) => {
		try {
		await axios.delete(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders/${id}`);
		
		// Remove the deleted order from the cache
		queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
			if (oldData) {
			return oldData.filter(order => order.id !== id);
			}
			return oldData;
		});
		
		// Optionally refetch to ensure data consistency
		//refetch();
		//await refresh
		await queryRefetch();

	
		} catch (error) {
			console.error('Failed to delete order:', error);
			throw error;
		}
	};


	if (!data) return <></>;

	return (
		<OrderContext.Provider
			value={{
				data: data,
				isLoading: isLoading,
				selected: selected,
				getById: getById,
				deleteById: deleteById
			}}
		>
			{children}
		</OrderContext.Provider>
	);
}
