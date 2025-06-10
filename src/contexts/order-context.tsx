"use client";

import { createContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Order } from "@/types/order";

export interface OrderContextType {
	data?: Order[];
	isError?: unknown;
	isLoading: boolean;
}

export interface OrderProvidrProps {}

export const OrderContext = createContext<OrderContextType>({ isLoading: true });

export function OrderProvider({ children }: { children: ReactNode }) {
	const { data, isLoading } = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: async () => {
			return (await axios.get(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders`)).data;
		},
	});

	if (!data) return <></>;

	return <OrderContext.Provider value={{ data: data, isLoading: isLoading }}>{children}</OrderContext.Provider>;
}
