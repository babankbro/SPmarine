"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { MainNav } from "@/components/dashboard/layout/main-nav";
import { SideNav } from "@/components/dashboard/layout/side-nav";
import { OrderProvider } from "@/contexts/order-context";
import { StationProvider } from "@/contexts/station-context";
import { TugboatProvider } from "@/contexts/tugboat-context";
import { CostProvider } from "@/contexts/cost-context";
import { CarrierProvider } from "@/contexts/carrier-context";
import { BargeProvider } from "@/contexts/barge-context";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<>
			<GlobalStyles
				styles={{
					body: {
						"--MainNav-height": "56px",
						"--MainNav-zIndex": 1000,
						"--SideNav-width": "280px",
						"--SideNav-zIndex": 1100,
						"--MobileNav-width": "320px",
						"--MobileNav-zIndex": 1100,
					},
				}}
			/>
			<Box
				sx={{
					bgcolor: "var(--mui-palette-background-default)",
					display: "flex",
					flexDirection: "column",
					position: "relative",
					minHeight: "100%",
				}}
			>
				<SideNav />
				<Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column", pl: { lg: "var(--SideNav-width)" } }}>
					<MainNav />
					<main>
						<Container maxWidth="xl" sx={{ py: "64px" }}>
							<OrderProvider>
								<StationProvider>
									<TugboatProvider>
										<CostProvider>
											<CarrierProvider>
												<BargeProvider>
													{children}
												</BargeProvider>
											</CarrierProvider>
										</CostProvider>
									</TugboatProvider>
								</StationProvider>
							</OrderProvider>
						</Container>
					</main>
				</Box>
			</Box>
		</>
	);
}
