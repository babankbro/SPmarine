"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";

import { useTugboat } from "@/hooks/use-tugboat";
import { useOrder } from "@/hooks/use-order";

import { Tugboat } from "@/components/dashboard/overview/tugboat";
import { TotalCustomers } from "@/components/dashboard/overview/total-customers";
import { TasksProgress } from "@/components/dashboard/overview/tasks-progress";
import { TotalProfit } from "@/components/dashboard/overview/total-profit";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

export default function Page(): React.JSX.Element {
	const _orderContext = useOrder();
    const tugboatContext = useTugboat();

	return (
		<Grid container spacing={3}>
			<Grid lg={3} sm={6} xs={12}>
        <Tugboat sx={{ height: "100%" }} count={tugboatContext.tugboat?.length || 0} />
			</Grid>
			<Grid lg={3} sm={6} xs={12}>
				<TotalCustomers diff={16} trend="down" sx={{ height: "100%" }} value="1.6k" />
			</Grid>
			<Grid lg={3} sm={6} xs={12}>
				<TasksProgress sx={{ height: "100%" }} value={75.5} />
			</Grid>
			<Grid lg={3} sm={6} xs={12}>
				<TotalProfit sx={{ height: "100%" }} value="$15k" />
			</Grid>
		</Grid>
	);
}
