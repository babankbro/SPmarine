"use client";

import RouterLink from "next/link";
import { JSX, useMemo } from "react";
import { Box, Typography, Link, Divider, Card, Checkbox } from "@mui/material";
import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { BoxArrowUp } from "@phosphor-icons/react/dist/ssr";
import { BoxArrowDown } from "@phosphor-icons/react/dist/ssr";

import { useSelection } from "@/hooks/use-selection";
import { Order } from "@/types/order";

interface OrderTableProps {
	count: number;
	page: number;
	rows: Order[];
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function OrderTable({
	count,
	page,
	rows,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
}: OrderTableProps): JSX.Element {
	const rowIds = useMemo(() => {
		return rows.map((customer) => customer.id);
	}, [rows]);

	const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
	const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
	const selectedAll = rows.length > 0 && selected?.size === rows.length;

	return (
		<Card>
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: "800px" }}>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									checked={selectedAll}
									indeterminate={selectedSome}
									onChange={(event) => {
										event.target.checked ? selectAll() : deselectAll();
									}}
								/>
							</TableCell>
							<TableCell>Product</TableCell>
							<TableCell>Dest</TableCell>
							<TableCell>Demand</TableCell>
							<TableCell>Type</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => {
							const isSelected = selected?.has(row.id);

							return (
								<TableRow hover key={row.id} selected={isSelected}>
									<TableCell padding="checkbox">
										<Checkbox
											checked={isSelected}
											onChange={(event) => {
												event.target.checked ? selectOne(row.id) : deselectOne(row.id);
											}}
										/>
									</TableCell>
									<TableCell>
										<Box component={RouterLink} href={`tugboats/${row.id}`}>
											<Link>
												<Typography variant="subtitle2">{row.productName}</Typography>
											</Link>
										</Box>
									</TableCell>
									<TableCell>
										{row.fromPoint} <ArrowRightIcon size={12} /> {row.destPoint}
									</TableCell>
									<TableCell>{row.demand}</TableCell>
									<TableCell>
										{row.type}
										{/* <BoxArrowUp /> */}
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
