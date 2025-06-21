"use client";

import RouterLink from "next/link";
import { useState, ChangeEvent } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";
import { Calculator as CalculatorIcon } from "@phosphor-icons/react/dist/ssr/Calculator";

import { Order } from "@/types/order";
import { OrderTable } from "@/components/order/order-table";
import { useOrder } from "@/hooks/use-order";
import { paths } from "@/paths";

export default function Page() {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [refreshKey, setRefreshKey] = useState(0); // Force re-render after deletion

	const orders: Order[] = useOrder();

	const handleImport = () => {
		// Implementation for CSV import
		console.log("Import functionality to be implemented");
	};

	const handleExport = () => {
		// Implementation for CSV export
		console.log("Export functionality to be implemented");
	};

	const handleCalculateSchedule = () => {
		// Implementation for schedule calculation
		console.log("Calculate Schedule functionality to be implemented");
		// This could trigger an optimization algorithm or navigate to a scheduling page
	};

	const handlePageChange = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleOrderDeleted = (deletedOrderId: string) => {
		// Force a refresh of the data by incrementing the refresh key
		// This will trigger a re-render and re-fetch of the orders
		setRefreshKey(prev => prev + 1);
		
		// If you're using React Query or similar, you might want to invalidate the query here
		// queryClient.invalidateQueries(['orders']);
	};

	const paginated = ApplyPaginated(orders, page, rowsPerPage);

	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3} sx={{ alignItems: "flex-start" }}>
				{/* Left Side - Title and Import/Export buttons */}
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Order Information</Typography>
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

				{/* Middle - Calculate Schedule button */}
				<div>
					<Button
						variant="contained"
						color="success"
						startIcon={<CalculatorIcon fontSize="var(--icon-fontSize-md)" />}
						onClick={handleCalculateSchedule}
						sx={{
							backgroundColor: "#15b79f", // Kepple green color from your theme
							"&:hover": {
								backgroundColor: "#0e9382", // Darker green for hover
							},
						}}
					>
						Calculate Schedule
					</Button>
				</div>

				{/* Right Side - Add button */}
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
				onOrderDeleted={handleOrderDeleted}
				key={refreshKey} // Force re-render when order is deleted
			/>
		</Stack>
	);
}

function ApplyPaginated(rows: Order[], page: number, rowsPerPage: number) {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}