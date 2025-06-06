import { JSX } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Stack, Typography } from "@mui/material";

import { BargeDetailsForm } from "@/components/dashboard/barge/barge-details-form";

interface Props {
	params: { id: string };
}

export default function Page({ params }: Props): JSX.Element {
	return (
		<Grid lg={8} md={6} xs={12}>
			<BargeDetailsForm id={params.id} />
		</Grid>
	);
}
