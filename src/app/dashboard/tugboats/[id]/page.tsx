
"use client";

import * as React from "react";
import type { JSX } from "react";
import Grid from "@mui/material/Unstable_Grid2";

import { TugboatDetailsForm } from "@/components/dashboard/tugboat/tugboat-details-form";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

interface PageParams {
  params: { id: string };
}

export default function Page({ params }: PageParams): JSX.Element {
  return (
    <Grid lg={8} md={6} xs={12}>
      <TugboatDetailsForm id={params.id} />
    </Grid>
  );
}