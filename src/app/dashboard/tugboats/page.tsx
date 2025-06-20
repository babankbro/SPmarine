"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import type { JSX, ChangeEvent } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";

import { TugboatTable } from "@/components/dashboard/tugboat/tugboat-table";
import type { Tugboat } from "@/types/tugboat";
import { useTugboat } from "@/hooks/use-tugboat";
import { paths } from "@/paths";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

export default function Page(): JSX.Element {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const tugboatContext = useTugboat();
	const paginatedTugboats = applyPagination(tugboatContext.tugboat || [], page, rowsPerPage);

	const handleImport = (): void => {
		// To be implemented
	};

	const handleExport = (): void => {
		// To be implemented
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
					<Typography variant="h4">Tugboats</Typography>
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
					<Button
						component={Link}
						href={`${paths.dashboard.tugboats}/new`}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>
			{/* <CustomersFilters /> */}
			<TugboatTable
				count={tugboatContext.tugboat?.length || 0}
				page={page}
				rows={paginatedTugboats}
				rowsPerPage={rowsPerPage}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>
		</Stack>
	);
}

function applyPagination(rows: Tugboat[], page: number, rowsPerPage: number): Tugboat[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}