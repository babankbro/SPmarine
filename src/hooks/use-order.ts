"use client";

import { useContext } from "react";

import { OrderContext, OrderContextType } from "@/contexts/order-context";

export function useOrder() {
	const { data } = useContext<OrderContextType>(OrderContext);
	if (!data) {
		throw new Error("useOrder must be used within a OrderProvider");
	}

	return data;
}
