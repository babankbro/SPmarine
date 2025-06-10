"use client";

import { useContext } from "react";

import { BargeContext, BargeContextType } from "@/contexts/barge-context";

export function useBarge() {
	const { barge } = useContext<BargeContextType>(BargeContext);
	if (!barge) {
		throw new Error("useBarge must be used within a BargeProvider");
	}

	return barge;
}
