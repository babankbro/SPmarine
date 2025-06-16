"use client";

import { useEffect, useState, useMemo } from "react";
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	Typography,
	Grid,
	Card,
	CardContent,
	CircularProgress,
	Autocomplete,
	Chip,
} from "@mui/material";
import { MagnifyingGlass as SearchIcon } from "@phosphor-icons/react";

import { Cost } from "@/types/cost";
import { Order } from "@/types/order";
import { Tugboat } from "@/types/tugboat";
import { useOrder } from "@/hooks/use-order";
import { useTugboat } from "@/hooks/use-tugboat";

interface CostTableProps {
	costs: Cost[];
	isLoading: boolean;
}

const SummaryCard = ({
	label,
	value,
	unit,
	colorIndex = 0,
}: {
	label: string;
	value: number;
	unit: string;
	colorIndex?: number;
}) => {
	const formattedValue = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

	const colors = [
		{ bg: "#e3f2fd", text: "#0d47a1", border: "#2196f3" },
		{ bg: "#e8f5e9", text: "#1b5e20", border: "#4caf50" },
		{ bg: "#fff8e1", text: "#ff8f00", border: "#ffc107" },
		{ bg: "#f3e5f5", text: "#6a1b9a", border: "#9c27b0" },
	];

	const colorTheme = colors[colorIndex % colors.length];

	return (
		<Card
			elevation={2}
			sx={{
				height: "100%",
				backgroundColor: colorTheme.bg,
				borderLeft: `4px solid ${colorTheme.border}`,
				transition: "transform 0.2s, box-shadow 0.2s",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 4,
				},
			}}
		>
			<CardContent>
				<Typography variant="body2" color="text.secondary">
					{label}
				</Typography>
				<Typography
					variant="h4"
					component="div"
					sx={{
						mt: 1,
						fontWeight: "bold",
						color: colorTheme.text,
					}}
				>
					{formattedValue}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{unit}
				</Typography>
			</CardContent>
		</Card>
	);
};

export function CostTable({ costs, isLoading }: CostTableProps) {
	const [filteredCosts, setFilteredCosts] = useState<Cost[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
	const [selectedTugboats, setSelectedTugboats] = useState<string[]>([]);
	const [totalDistance, setTotalDistance] = useState(0);
	const [totalFuelConsumption, setTotalFuelConsumption] = useState(0);
	const [totalTime, setTotalTime] = useState(0);
	const [totalWeight, setTotalWeight] = useState(0);
	const tugboatList: Tugboat[] = useTugboat();
	const orderList = useOrder();

	if (!costs) return <></>;

	useEffect(() => {
		// Apply filtering based on searchTerm and selected filters
		const newFilteredCosts = costs.filter((cost) => {
			const matchesSearch =
				!searchTerm ||
				cost.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
				cost.tugboatId.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesTugboat = selectedTugboats.length === 0 || selectedTugboats.includes(cost.tugboatId);

			const matchesOrder = selectedOrders.length === 0 || selectedOrders.includes(cost.orderId);

			return matchesSearch && matchesTugboat && matchesOrder;
		});

		// Calculate total values
		const calculatedTotalWeight = newFilteredCosts.reduce((sum, cost) => sum + cost.totalLoad, 0);
		const calculatedTotalDistance = newFilteredCosts.reduce((sum, cost) => sum + cost.distance, 0);
		const calculatedTotalTime = newFilteredCosts.reduce((sum, cost) => sum + cost.time, 0);
		const calculatedTotalFuelConsumption = newFilteredCosts.reduce(
			(sum, cost) => sum + cost.time * cost.consumptionRate,
			0,
		);

		setTotalWeight(calculatedTotalWeight);
		setTotalDistance(calculatedTotalDistance);
		setTotalTime(calculatedTotalTime);
		setTotalFuelConsumption(calculatedTotalFuelConsumption);
		setFilteredCosts(newFilteredCosts);
	}, [costs, searchTerm, selectedTugboats, selectedOrders]);

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(num);
	};

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ width: "100%" }}>
			{/* Report Header */}
			<Typography
				variant="h3"
				component="h1"
				gutterBottom
				sx={{
					fontWeight: 800,
					mt: 2,
					mb: 3,
					color: "#0d47a1",
					textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
					borderBottom: "2px solid #2196f3",
					paddingBottom: 1,
				}}
			>
				Tugboat Fuel Cost Analysis Report
			</Typography>

			{/* Summary Cards */}
			<Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
				<Grid item xs={12} sm={6} md={3}>
					<SummaryCard label="Total Cargo Weight" value={totalWeight} unit="tons" colorIndex={0} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<SummaryCard label="Total Distance" value={totalDistance} unit="kilometers" colorIndex={1} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<SummaryCard label="Total Travel Time" value={totalTime} unit="hours" colorIndex={2} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<SummaryCard label="Total Fuel Consumption" value={totalFuelConsumption} unit="liters" colorIndex={3} />
				</Grid>
			</Grid>

			{/* Table Section with Tugboat Filter */}
			<Box sx={{ mb: 2 }}>
				<Autocomplete
					multiple
					id="tugboat-filter"
					options={tugboatList?.length > 0 ? tugboatList.map((t) => t.id) : []}
					noOptionsText="No tugboats available"
					getOptionLabel={(tugboatId) => {
						const tugboat = tugboatList?.find((t) => t.id === tugboatId);
						return tugboatId;
					}}
					value={selectedTugboats}
					onChange={(_, newValue) => {
						setSelectedTugboats(newValue);
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="outlined"
							label="Filter by Tugboats"
							placeholder="Select tugboats"
							fullWidth
						/>
					)}
					renderTags={(selectedIds, getTagProps) =>
						selectedIds.map((id, index) => {
							const tugboat = tugboatList?.find((t) => t.id === id);
							return <Chip label={tugboat?.name || id} {...getTagProps({ index })} color="primary" />;
						})
					}
				/>
				<Autocomplete
					multiple
					id="order-filter"
					options={orderList?.length > 0 ? orderList.map((t) => t.id) : []}
					noOptionsText="No orders available"
					getOptionLabel={(orderId) => orderId}
					value={selectedOrders}
					onChange={(_, newValue) => {
						setSelectedOrders(newValue);
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="outlined"
							label="Filter by Order IDs"
							placeholder="Select order IDs"
							fullWidth
						/>
					)}
					renderTags={(selectedIds, getTagProps) =>
						selectedIds.map((id, index) => <Chip label={id} {...getTagProps({ index })} color="secondary" />)
					}
				/>
			</Box>

			{/* Data Table */}
			<TableContainer
				component={Paper}
				elevation={2}
				sx={{
					borderRadius: 2,
					overflow: "hidden",
					boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
				}}
			>
				<Table sx={{ minWidth: 650 }}>
					<TableHead
						sx={{
							backgroundColor: (theme) => theme.palette.primary.dark,
							position: "sticky",
							top: 0,
							zIndex: 1,
							boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
						}}
					>
						<TableRow>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Tugboat ID</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Order</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Weight (tons)</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Distance (km)</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Travel Time (hrs)</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Liters/hr</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Fuel Used (liters)</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white" }}>Liters/ton</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredCosts.length > 0 ? (
							filteredCosts.map((cost, index) => {
								// const tugboat = tugboatList?.find((t) => t.id === cost.tugboatId);
								// Calculate derived values
								const fuelUsed = cost.time * cost.consumptionRate;
								const litersPerTon = cost.totalLoad > 0 ? fuelUsed / cost.totalLoad : 0;

								return (
									<TableRow
										key={`${cost.tugboatId}-${cost.orderId}`}
										hover
										sx={{
											backgroundColor: index % 2 === 0 ? "white" : "#f5f5f5",
											transition: "background-color 0.2s",
											"&:hover": {
												backgroundColor: "#e3f2fd",
											},
										}}
									>
										{/*<TableCell sx={{ fontWeight: "medium" }}>{tugboat?.name || cost.tugboatId}</TableCell>
										 */}
										<TableCell>{cost.orderId}</TableCell>
										<TableCell>{formatNumber(cost.totalLoad)}</TableCell>
										<TableCell>{formatNumber(cost.distance)}</TableCell>
										<TableCell>{formatNumber(cost.time)}</TableCell>
										<TableCell>{formatNumber(cost.consumptionRate)}</TableCell>
										<TableCell
											sx={{
												color: fuelUsed > 500 ? "#d32f2f" : "#2e7d32",
												fontWeight: "bold",
											}}
										>
											{formatNumber(fuelUsed)}
										</TableCell>
										<TableCell>{formatNumber(litersPerTon)}</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={8} align="center">
									No cost data found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
