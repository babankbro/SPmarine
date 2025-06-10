"use client";

import { JSX, useMemo, ChangeEvent } from "react";
import dayjs from "dayjs";
import RouterLink from "next/link";
import { Box, Typography, Link, Divider, Card, Checkbox } from "@mui/material";
import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from "@mui/material";

import { useSelection } from "@/hooks/use-selection";
import { Barge } from "@/types/barge";

interface BargeTableProps {
	count: number;
	page: number;
	rows: Barge[];
	rowsPerPage?: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function BargeTable({
	count,
	rows,
	page,
	rowsPerPage = 0,
	onPageChange,
	onRowsPerPageChange,
}: BargeTableProps): JSX.Element {
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
							<TableCell>Name</TableCell>
							<TableCell>Water Status</TableCell>
							<TableCell>Distance Km</TableCell>
							<TableCell>Ready Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row: Barge) => {
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
										<Box component={RouterLink} href={`barges/${row.id}`}>
											<Link>
												<Typography variant="subtitle2">{row.name}</Typography>
											</Link>
										</Box>
									</TableCell>
									<TableCell>{row.waterStatus}</TableCell>
									<TableCell>{row.distanceKm} KM</TableCell>
									<TableCell>{dayjs(row.readyDatetime).format("MMM D, YYYY")}</TableCell>
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
