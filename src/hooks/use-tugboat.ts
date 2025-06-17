"use client";

import { useContext } from "react";

import { TugboatContext, TugboatContextType } from "@/contexts/tugboat-context";

export function useTugboat() {
	const context = useContext(TugboatContext);

	if (context === undefined) throw new Error("");

	return context;
}
