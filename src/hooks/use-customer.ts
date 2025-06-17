"use client";

import { useContext } from "react";

import { CustomerContext } from "@/contexts/customer-context";

export function useCustomer() {
	const context = useContext(CustomerContext);
	if (!context) throw new Error("");

	return context;
}