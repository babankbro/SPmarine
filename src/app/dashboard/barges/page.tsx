"use client";

import { JSX, useState, ChangeEvent } from "react";
import Link from "next/link";
import { Stack, Typography, Button } from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";

import { BargeTable } from "@/components/dashboard/barge/barge-table";
import { useBarge } from "@/hooks/use-barge";
import { Barge } from "@/types/barge";
import { paths } from "@/paths";

export default function Page(): JSX.Element {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const barge: Barge[] = useBarge();
	const paginatedBarges = applyPagination(barge, page, rowsPerPage);

	const handleImport = () => {};

	const handleExport = () => {};

	const handlePageChange = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Barge</Typography>
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
						href={`${paths.dashboard.barges}/new`}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>
			{/* <CustomersFilters /> */}
			<BargeTable
				count={barge.length}
				page={page}
				rows={paginatedBarges}
				rowsPerPage={rowsPerPage}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>
		</Stack>
	);
}

function applyPagination(rows: Barge[], page: number, rowsPerPage: number) {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
