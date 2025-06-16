import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import type { SxProps } from "@mui/material/styles";
import { ListBullets as ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";

export interface TasksProgressProps {
	sx?: SxProps;
	value: number;
}

export function TasksProgress({ value, sx }: TasksProgressProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardContent>
				<Stack spacing={2}>
					<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
						<Stack spacing={1}>
							<Typography color="text.secondary" gutterBottom variant="overline">
								Task Progress
							</Typography>
							<Typography variant="h4">{value}%</Typography>
						</Stack>
						<Avatar sx={{ backgroundColor: "var(--mui-palette-warning-main)", height: "56px", width: "56px" }}>
							<ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</Stack>
					<div>
						<LinearProgress value={value} variant="determinate" />
					</div>
				</Stack>
			</CardContent>
		</Card>
	);
}
