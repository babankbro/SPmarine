"use client";

import { JSX, useState, ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { BargeProvider } from "@/contexts/barge-context";
import { CarrierProvider } from "@/contexts/carrier-context";
import { CustomerProvider } from "@/contexts/customer-context";
import { OrderProvider } from "@/contexts/order-contex";
import { StationProvider } from "@/contexts/station-context";
import { TugboatProvider } from "@/contexts/tugboat-context";
import { CostProvider } from "./cost-context";

interface QueryProviderProps {
	children: ReactNode;
}

function ServicesProvider({ children }: { children: React.ReactNode }) {
	return (
		<BargeProvider>
			<CarrierProvider>
				<CustomerProvider>
					<OrderProvider>
						<StationProvider>
							<TugboatProvider>
								<CostProvider>
									{children}
								</CostProvider>
							</TugboatProvider>
						</StationProvider>
					</OrderProvider>
				</CustomerProvider>
			</CarrierProvider>
		</BargeProvider>
	);
}

export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
	const [queryclient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryclient}>
			<ServicesProvider>{children}</ServicesProvider>
		</QueryClientProvider>
	);
}