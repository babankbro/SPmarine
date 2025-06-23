"use client";

import * as React from "react";
import {
	Avatar,
	Box,
	Card,
	Chip,
	Divider,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
	IconButton,
	Tooltip,
} from "@mui/material";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { MapPin as MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { Boat as BoatIcon } from "@phosphor-icons/react/dist/ssr/Boat";

import { TugboatSchedule } from "@/types/tugboat-schedule";

function noop(): void {
	// do nothing
}

export interface TugboatScheduleTableProps {
	count?: number;
	page?: number;
	rows?: TugboatSchedule[];
	rowsPerPage?: number;
	onPageChange?: (event: unknown, newPage: number) => void;
	onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TugboatScheduleTable({
	count = 0,
	rows = [],
	page = 0,
	rowsPerPage = 0,
	onPageChange = noop,
	onRowsPerPageChange = noop,
}: TugboatScheduleTableProps): React.JSX.Element {
	const rowIds = React.useMemo(() => {
		return rows.map((schedule) => schedule.id);
	}, [rows]);

	const getTypeColor = (type: string) => {
		switch (type?.toUpperCase()) {
			case "DEPARTURE":
				return "warning";
			case "ARRIVAL":
				return "success";
			case "TRANSIT":
				return "info";
			default:
				return "default";
		}
	};

	const formatDateTime = (dateTimeString: string) => {
		try {
			const date = new Date(dateTimeString);
			return {
				date: date.toLocaleDateString(),
				time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
			};
		} catch {
			return { date: 'Invalid Date', time: '' };
		}
	};

	return (
		<Card>
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: "1000px" }}>
					<TableHead>
						<TableRow>
							<TableCell>Schedule Info</TableCell>
							<TableCell>Tugboat & Order</TableCell>
							<TableCell>Enter DateTime</TableCell>
							<TableCell>Exit DateTime</TableCell>
							<TableCell>Distance & Time</TableCell>
							<TableCell>Load & Barges</TableCell>
							<TableCell>Type</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, idx) => {
							const enterDateTime = formatDateTime(row.enter_datetime);
							const exitDateTime = formatDateTime(row.exit_datetime);
							const orderArrivalTime = formatDateTime(row.order_arrival_time);

							return (
								<TableRow hover key={row.id ?? idx}>
									<TableCell>
										<Stack spacing={1}>
											<Typography variant="subtitle2">
												{row.name || `Schedule #${row.id}`}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												ID: {row.id}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Water: {row.water_type}
											</Typography>
										</Stack>
									</TableCell>
									
									<TableCell>
										<Stack spacing={1}>
											<Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
												<BoatIcon size={16} />
												Tugboat: {row.tugboat_id}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Order: {row.order_id}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Trip: {row.order_trip}
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Stack spacing={1}>
											<Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
												<ClockIcon size={16} />
												{enterDateTime.date}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{enterDateTime.time}
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Stack spacing={1}>
											<Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
												<ClockIcon size={16} />
												{exitDateTime.date}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{exitDateTime.time}
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Stack spacing={1}>
											<Typography variant="body2">
												Distance: {row.distance || 0} km
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Time: {row.time} hrs
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Speed: {row.speed} km/h
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Stack spacing={1}>
											<Typography variant="body2">
												Load: {row.total_load} tons
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Barges: {row.barge_ids}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Barge Speed: {row.barge_speed} km/h
											</Typography>
										</Stack>
									</TableCell>

									<TableCell>
										<Stack spacing={1}>
											<Chip
												color={getTypeColor(row.type) as any}
												label={row.type || 'Unknown'}
												size="small"
												variant="outlined"
											/>
											<Typography variant="body2" color="text.secondary">
												Point: {row.type_point}
											</Typography>
										</Stack>
									</TableCell>

									<TableCell align="right">
										<Tooltip title="View Details">
											<IconButton>
												<EyeIcon />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Box>
			<Divider />
			<TablePagination
				component="div"
				count={count}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</Card>
	);
}