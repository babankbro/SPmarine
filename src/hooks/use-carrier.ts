"use client";

import { useContext } from "react";

import { CarrierContext, CarrierContextType } from "@/contexts/carrier-context";

export function useCarrier() {
	const { carrier } = useContext<CarrierContextType>(CarrierContext);
	if (!carrier) {
		throw new Error("useBarge must be used within a BargeProvider");
	}

	return carrier;
}
