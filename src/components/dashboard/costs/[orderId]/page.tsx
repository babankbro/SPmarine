"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Box, Container, Grid, Button, CircularProgress, Card, CardContent } from "@mui/material";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react";

import { useCost } from "@/contexts/cost-context";
// import { useOrder } from "@/contexts/order-context";
import { useTugboat } from "@/hooks/use-tugboat";
// import { useOrder } from "@/hooks/use-order";

export default function CostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tugboatId = params.tugboatId as string;
	const orderId = params.orderId as string;

	const { getByIds, isLoading } = useCost();
	const { getById: getTugboat } = useTugboat();
	// const { getById: getOrder } = useOrder();

	const cost = getByIds(tugboatId, orderId);
	const tugboat = cost ? getTugboat?.(cost.tugboatId) : null;
	// const order = cost ? getOrder?.(cost.orderId) : null;

	useEffect(() => {
		document.title = cost ? `Cost Detail | Dashboard` : "Cost Detail | Dashboard";
	}, [cost]);

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(num);
	};

	if (isLoading) {
		return (
			<Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
				<CircularProgress />
			</Container>
		);
	}

	if (!cost) {
		return (
			<Container>
				<Typography variant="h5" color="error">
					Cost record not found
				</Typography>
				<Button startIcon={<ArrowLeftIcon />} onClick={() => router.push("/dashboard/costs")} sx={{ mt: 2 }}>
					Back to Costs
				</Button>
			</Container>
		);
	}

	return (
		<Container>
			<Box sx={{ py: 3 }}>
				<Button startIcon={<ArrowLeftIcon />} onClick={() => router.push("/dashboard/costs")} sx={{ mb: 3 }}>
					Back to Costs
				</Button>

				<Typography variant="h4" sx={{ mb: 4 }}>
					Cost Details
				</Typography>

				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<Card elevation={2}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Tugboat Information
								</Typography>
								<Typography variant="body1">ID: {cost.tugboatId}</Typography>
								{tugboat && <Typography variant="body1">Name: {tugboat.name}</Typography>}
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={6}>
						<Card elevation={2}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Order Information
								</Typography>
								<Typography variant="body1">Order ID: {cost.orderId}</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12}>
						<Card elevation={2}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Cost Details
								</Typography>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6} md={4}>
										<Typography variant="body2" color="textSecondary">
											Time (hours)
										</Typography>
										<Typography variant="body1">{formatNumber(cost.time)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Typography variant="body2" color="textSecondary">
											Distance (km)
										</Typography>
										<Typography variant="body1">{formatNumber(cost.distance)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Typography variant="body2" color="textSecondary">
											Consumption Rate
										</Typography>
										<Typography variant="body1">{formatNumber(cost.consumptionRate)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Typography variant="body2" color="textSecondary">
											Cost
										</Typography>
										<Typography variant="body1">{formatNumber(cost.cost)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Typography variant="body2" color="textSecondary">
											Total Load
										</Typography>
										<Typography variant="body1">{formatNumber(cost.totalLoad)}</Typography>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>
		</Container>
	);
}
