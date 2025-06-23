"use client";

import * as React from "react";
import { useState } from "react";
import type { JSX, ChangeEvent } from "react";
import { Button, Stack, Typography, Card, CardContent, Grid, CircularProgress, Alert } from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { CalendarBlank as CalendarIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";

import { TugboatScheduleTable } from "@/components/dashboard/tugboat-schedule/tugboat-schedule-table";
import { TugboatScheduleFilters } from "@/components/dashboard/tugboat-schedule/tugboat-schedule-filters";
import type { TugboatSchedule, TugboatScheduleFilters as FilterType } from "@/types/tugboat-schedule";
import { useTugboatSchedule } from "@/hooks/use-tugboat-schedule";

export default function Page(): JSX.Element {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [filters, setFilters] = useState<FilterType>({
		tugboat_id: "",
		order_id: "",
		enter_datetime: "",
		exit_datetime: "",
		type: "",
		type_point: "",
	});

	const { schedules, loading, error, refetch } = useTugboatSchedule(filters);
	const paginatedSchedules = applyPagination(schedules, page, rowsPerPage);

	const handleExport = () => {
		console.log("Exporting tugboat schedule results...");
	};

	const handlePageChange = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFiltersChange = (newFilters: FilterType) => {
		setFilters(newFilters);
		setPage(0);
	};

	// Calculate summary statistics
	const totalSchedules = schedules.length;
	const totalOrderDistanceSchedules = Array.isArray(schedules)
  ? schedules.reduce((sum, s) => sum + (Number(s.order_distance) || 0), 0)
  : 0;

  const totalOrderTimeSchedules = Array.isArray(schedules)
  ? schedules.reduce((sum, s) => sum + (Number(s.order_time) || 0), 0)
  : 0;
	 
  

  const totalLoad = Array.isArray(schedules)
  ? schedules.reduce((sum, s) => sum + (Number(s.total_load) || 0), 0)
  : 0;

	
	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Tugboat Schedule Result</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<CalendarIcon fontSize="var(--icon-fontSize-md)" />
						<Typography variant="body2" color="text.secondary">
							Schedule management and tracking results
						</Typography>
					</Stack>
				</Stack>
				<div>
					<Button
						color="inherit"
						startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
						onClick={handleExport}
						variant="outlined"
						disabled={loading}
					>
						Export Results
					</Button>
				</div>
			</Stack>

			{/* Summary Cards */}
			<Grid container spacing={3}>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Stack spacing={1}>
								<Typography variant="h6" color="primary">
									{loading ? <CircularProgress size={20} /> : totalSchedules}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Total Schedules
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Stack spacing={1}>
								<Typography variant="h6" color="warning.main">
									{loading ? <CircularProgress size={20} /> : totalOrderDistanceSchedules} km
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Oder Distance
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Stack spacing={1}>
								<Typography variant="h6" color="success.main">
									{loading ? <CircularProgress size={20} /> : totalOrderTimeSchedules} h
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Order Time
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Stack spacing={1}>
								<Typography variant="h6" color="info.main">
									{loading ? <CircularProgress size={20} /> : totalLoad}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Total Load
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Error Display */}
			{error && (
				<Alert severity="error" action={
					<Button color="inherit" size="small" onClick={refetch}>
						Retry
					</Button>
				}>
					{error}
				</Alert>
			)}

			{/* Filters */}
			<TugboatScheduleFilters filters={filters} onChange={handleFiltersChange} />

			{/* Loading State */}
			{loading && (
				<Card>
					<CardContent>
						<Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ py: 4 }}>
							<CircularProgress />
							<Typography variant="body1">Loading schedule data...</Typography>
						</Stack>
					</CardContent>
				</Card>
			)}

			{/* Schedule Table */}
			{!loading && (
				<TugboatScheduleTable
					count={schedules.length}
					page={page}
					rows={paginatedSchedules}
					rowsPerPage={rowsPerPage}
					onPageChange={handlePageChange}
					onRowsPerPageChange={handleRowsPerPageChange}
				/>
			)}
		</Stack>
	);
}

function applyPagination(rows: TugboatSchedule[], page: number, rowsPerPage: number): TugboatSchedule[] {
	
	if (!Array.isArray(rows)) return [];
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}