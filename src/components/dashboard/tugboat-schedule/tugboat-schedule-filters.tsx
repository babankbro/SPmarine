"use client";

import * as React from "react";
import {
	Card,
	CardContent,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
	Button,
	Grid,
} from "@mui/material";
import { MagnifyingGlass as SearchIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { X as ClearIcon } from "@phosphor-icons/react/dist/ssr/X";
import { http } from "@/http";
import type { Tugboat } from "@/types/tugboat";
import type { Order } from "@/types/order";

import { TugboatScheduleFilters as Filters } from "@/types/tugboat-schedule";

export interface TugboatScheduleFiltersProps {
	filters: Filters;
	onChange: (filters: Filters) => void;
}

export interface TypePoint {
	type_point: string;
}

export function TugboatScheduleFilters({ filters, onChange }: TugboatScheduleFiltersProps): React.JSX.Element {
	const [tugboats, setTugboats] = React.useState<Tugboat[]>([]);
	const [orders, setOrders] = React.useState<Order[]>([]);
	const [typePoint, setTypePoint] = React.useState<TypePoint[]>([]);

	React.useEffect(() => {
		http.get<Tugboat[]>("tugboats").then((res) => setTugboats(res.data));
		http.get<Order[]>("orders").then((res) => setOrders(res.data));
		http.get<TypePoint[]>("schedules/view-type-point").then((res:any) => {
			console.log(res);
			const data = res.data?.data;
			if (Array.isArray(data)) {
				setTypePoint(data);
			} else {
				setTypePoint([]);
			}
		});
	}, []);

	const handleFilterChange = (field: keyof Filters, value: string) => {
		onChange({
			...filters,
			[field]: value,
		});
	};

	const handleClearFilters = () => {
		onChange({
			tugboat_id: "",
			order_id: "",
			enter_datetime: "",
			exit_datetime: "",
			type: "",
			type_point: "",
		});
	};

	const hasActiveFilters = Object.values(filters).some((value) => value !== "");

	return (
		<Card>
			<CardContent>
				<Stack spacing={3}>
					<Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
						<Typography variant="h6">Filters</Typography>
						{hasActiveFilters && (
							<Button color="inherit" onClick={handleClearFilters} size="small" startIcon={<ClearIcon />}>
								Clear All
							</Button>
						)}
					</Stack>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel id="tugboat-select-label">Tugboat</InputLabel>
								<Select
									labelId="tugboat-select-label"
									label="Tugboat"
									name="tugboat_id"
									value={filters.tugboat_id}
									onChange={(event) => handleFilterChange("tugboat_id", event.target.value)}
								>
									<MenuItem value="">
										<em>เลือก Tugboat</em>
									</MenuItem>
									{tugboats.map((tugboat) => (
										<MenuItem key={tugboat.id} value={tugboat.id}>
											{tugboat.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel id="order-select-label">Order</InputLabel>
								<Select
									labelId="order-select-label"
									label="Order"
									name="order_id"
									value={filters.order_id}
									onChange={(event) => handleFilterChange("order_id", event.target.value)}
								>
									<MenuItem value="">
										<em>เลือก Order</em>
									</MenuItem>
									{orders.map((order) => (
										<MenuItem key={order.id} value={order.id}>
											{order.id} - {order.productName}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						
						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel>Type</InputLabel>
								<Select
									label="Type"
									name="type"
									value={filters.type}
									onChange={(event) => handleFilterChange("type", event.target.value)}
								>
									<MenuItem value="">All Types</MenuItem>
									<MenuItem value="DEPARTURE">Departure</MenuItem>
									<MenuItem value="ARRIVAL">Arrival</MenuItem>
									<MenuItem value="TRANSIT">Transit</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel>Type Point</InputLabel>
								<Select
									label="Type Point"
									name="type_point"
									value={filters.type_point}
									onChange={(event) => handleFilterChange("type_point", event.target.value)}
								>
									<MenuItem value="">
										<em>เลือก Type Point</em>
									</MenuItem>
									{typePoint.map((type) => (
										<MenuItem key={type?.type_point} value={type?.type_point}>
											{type?.type_point}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
					<Typography variant="subtitle2" sx={{ mt: 2 }}>
						Enter DateTime Range
					</Typography>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Enter Start DateTime"
								name="enter_datetime"
								type="datetime-local"
								value={filters.enter_datetime}
								onChange={(event) => handleFilterChange("enter_datetime", event.target.value)}
								InputLabelProps={{
									shrink: true,
								}}
								size="small"
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Enter End DateTime"
								name="exit_datetime"
								type="datetime-local"
								value={filters.exit_datetime}
								onChange={(event) => handleFilterChange("exit_datetime", event.target.value)}
								InputLabelProps={{
									shrink: true,
								}}
								size="small"
							/>
						</Grid>
					</Grid>
				</Stack>
			</CardContent>
		</Card>
	);
}