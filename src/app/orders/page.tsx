"use client";

import RouterLink from "next/link";
import { useState, ChangeEvent } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";

import { Order } from "@/types/order";
import { OrderTable } from "@/components/order/order-table";
import { useOrder } from "@/hooks/use-order";
import { paths } from "@/paths";

export default function Page() {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const orders: Order[] = useOrder();

	const handleImport = () => {};

	const handleExport = () => {};

	const handlePageChange = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const paginated = ApplyPaginated(orders, page, rowsPerPage);

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
						component={RouterLink}
						href={`${paths.dashboard.tugboats}/new`}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>
			{/* <CustomersFilters /> */}
			<OrderTable
				count={orders.length}
				page={page}
				rows={paginated}
				rowsPerPage={rowsPerPage}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>
		</Stack>
	);
}

function ApplyPaginated(rows: Order[], page: number, rowsPerPage: number) {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
