import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  Typography
} from "@mui/material";
import type { SxProps } from "@mui/material/styles";
import { Receipt as ReceiptIcon } from "@phosphor-icons/react/dist/ssr/Receipt";

export interface TotalProfitProps {
	sx?: SxProps;
	value: string;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardContent>
				<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
					<Stack spacing={1}>
						<Typography color="text.secondary" variant="overline">
							Total Profit
						</Typography>
						<Typography variant="h4">{value}</Typography>
					</Stack>
					<Avatar sx={{ backgroundColor: "var(--mui-palette-primary-main)", height: "56px", width: "56px" }}>
						<ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
					</Avatar>
				</Stack>
			</CardContent>
		</Card>
	);
}
