"use client";

import { useContext } from "react";

import { TugboatContext, TugboatContextType } from "@/contexts/tugboat-context";

export function useTugboat() {
  const { tugboat } = useContext<TugboatContextType>(TugboatContext);
  if (!tugboat) {
    throw new Error("useTugboat must be used within a TugboatProvider");
  }
	// const { tugboat, getById } = useContext<TugboatContextType>(TugboatContext);
  if (!tugboat) throw new Error("");

	return tugboat;
}
