"use client";

import React, { useState } from "react";
import {
  Button,
  Stack,
  Typography
} from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";

import { StationTable } from "@/components/dashboard/station/station-table";
import { useStation } from "@/hooks/use-station";
import type { Station } from "@/types/station"; 
import type { ChangeEvent, JSX } from "react";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

export default function Page(): JSX.Element {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const stationContext = useStation();
	const paginatedBarges = applyPagination(stationContext.station || [], page, rowsPerPage);

	const handleImport = (): void => {
		// TODO: Implement import functionality
	};

	const handleExport = (): void => {
		// TODO: Implement export functionality
	};

	const handlePageChange = (event: unknown, newPage: number): void => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Stations</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Button
							color="inherit"
							startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
							onClick={handleImport}
						>
							Import
						</Button>
						<Button
							color="inherit"
							startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
							onClick={handleExport}
						>
							Export
						</Button>
					</Stack>
				</Stack>
				<div>
					<Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
						Add
					</Button>
				</div>
			</Stack>
			{/* <CustomersFilters /> */}
			<StationTable
				count={stationContext.station?.length || 0}
				page={page}
				rows={paginatedBarges}
				rowsPerPage={rowsPerPage}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>
		</Stack>
	);
}

function applyPagination(rows: Station[], page: number, rowsPerPage: number): Station[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
