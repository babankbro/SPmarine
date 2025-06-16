"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import type { SxProps } from "@mui/material/styles";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { Desktop as DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { DeviceTablet as DeviceTabletIcon } from "@phosphor-icons/react/dist/ssr/DeviceTablet";
import { Phone as PhoneIcon } from "@phosphor-icons/react/dist/ssr/Phone";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/components/core/chart";

type IconMapping = Record<string, Icon>;

const iconMapping: IconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon };

export interface TrafficProps {
	chartSeries: number[];
	labels: string[];
	sx?: SxProps;
}

export function Traffic({ chartSeries, labels, sx }: TrafficProps): React.JSX.Element {
	const chartOptions = useChartOptions(labels);

	return (
		<Card sx={sx}>
			<CardHeader title="Traffic source" />
			<CardContent>
				<Stack spacing={2}>
					<Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
					<Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
						{chartSeries.map((item, index) => {
							const label = labels[index];
							const Icon = iconMapping[label];

							return (
								<Stack key={label} spacing={1} sx={{ alignItems: "center" }}>
									{Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
									<Typography variant="h6">{label}</Typography>
									<Typography color="text.secondary" variant="subtitle2">
										{item}%
									</Typography>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}

function useChartOptions(labels: string[]): ApexOptions {
	const theme = useTheme();

	return {
		chart: { background: "transparent" },
		colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
		dataLabels: { enabled: false },
		labels,
		legend: { show: false },
		plotOptions: { pie: { expandOnClick: false } },
		states: { active: { filter: { type: "none" } }, hover: { filter: { type: "none" } } },
		stroke: { width: 0 },
		theme: { mode: theme.palette.mode },
		tooltip: { fillSeriesColor: false },
	};
}
