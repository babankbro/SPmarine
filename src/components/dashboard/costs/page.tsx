"use client";

import { Box, Container } from "@mui/material";

import { CostTable } from "@/components/dashboard/costs/cost-table";
import { useCost } from "@/contexts/cost-context";

export default function CostsPage() {
	const { costList, isLoading } = useCost();

	return (
		<Container maxWidth="xl">
			<Box sx={{ py: 3 }}>
				<CostTable costs={costList} isLoading={isLoading} />
			</Box>
		</Container>
	);
}
