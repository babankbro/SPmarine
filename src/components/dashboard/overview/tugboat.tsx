import type { SxProps } from "@mui/material/styles";
import { JSX } from "react";
import { Avatar, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { Boat as BoatIcon } from "@phosphor-icons/react/dist/ssr/Boat";

export interface TugboatProps {
	sx?: SxProps;
	count: number;
}

export function Tugboat({ sx, count = 0 }: TugboatProps): JSX.Element {
	return (
		<Card sx={sx}>
			<CardContent>
				<Stack spacing={3}>
					<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
						<Stack spacing={1}>
							<Typography color="text.secondary" variant="overline" children={"Tugboat"} />
							<Typography variant="h4">{count}</Typography>
						</Stack>
						<Avatar sx={{ backgroundColor: "var(--mui-palette-primary-main)", height: "56px", width: "56px" }}>
							<BoatIcon fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</Stack>
					<Divider />
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						{/* TODO: show tugboat free if not show count = 0 */}
						<Typography color="text.secondary" variant="caption">
							free 0
						</Typography>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
