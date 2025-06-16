import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";
import type { SxProps } from "@mui/material/styles";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import dayjs from "dayjs";

type StatusType = "pending" | "delivered" | "refunded";
type StatusMapType = {
  [key in StatusType]: {
    label: string;
    color: "warning" | "success" | "error";
  }
};

const statusMap: StatusMapType = {
	pending: { label: "Pending", color: "warning" },
	delivered: { label: "Delivered", color: "success" },
	refunded: { label: "Refunded", color: "error" },
};

export interface Order {
	id: string;
	customer: { name: string };
	amount: number;
	status: StatusType;
	createdAt: Date;
}

export interface LatestOrdersProps {
	orders?: Order[];
	sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardHeader title="Latest orders" />
			<Divider />
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: 800 }}>
					<TableHead>
						<TableRow>
							<TableCell>Order</TableCell>
							<TableCell>Customer</TableCell>
							<TableCell sortDirection="desc">Date</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map((order) => {
							const { label, color } = statusMap[order.status] ?? { label: "Unknown", color: "default" as const };

							return (
								<TableRow hover key={order.id}>
									<TableCell>{order.id}</TableCell>
									<TableCell>{order.customer.name}</TableCell>
									<TableCell>{dayjs(order.createdAt).format("MMM D, YYYY")}</TableCell>
									<TableCell>
										<Chip color={color} label={label} size="small" />
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Box>
			<Divider />
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button
					color="inherit"
					endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
					size="small"
					variant="text"
				>
					View all
				</Button>
			</CardActions>
		</Card>
	);
}
