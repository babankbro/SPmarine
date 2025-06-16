"use client";

import React from "react";
import type { JSX } from "react";
import { Grid } from "@mui/material";

import { BargeDetailsForm } from "@/components/dashboard/barge/barge-details-form";

interface BargePageProps {
	params: { id: string };
}

export default function Page({ params }: BargePageProps): JSX.Element {
	return (
		<Grid container lg={8} md={6} xs={12}>
			<BargeDetailsForm id={params.id} />
		</Grid>
	);
}
