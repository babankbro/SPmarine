"use client";

import { useContext } from "react";
import { OrderContext } from "@/contexts/order-context";
import type { OrderContextType } from "@/contexts/order-context";

export function useOrder(): OrderContextType {
	const context = useContext<OrderContextType>(OrderContext);
	
	if (!context.data) {
		throw new Error("useOrder must be used within a OrderProvider");
	}
	
	return context;
}
