"use client";

import React from "react";
import {
  Button,
  Stack,
  Typography
} from "@mui/material";
import type { JSX } from "react";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";

import { CarrierTable } from "@/components/dashboard/carrier/carrier-table";
import { useCarrier } from "@/hooks/use-carrier";
import type { Carrier } from "@/types/carrier";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

export default function Page(): JSX.Element {
  const carrierContext = useCarrier();
  const page = 0;
  const rowsPerPage = 5;
  const paginatedCarrier = applyPagination(carrierContext.carrier || [], page, rowsPerPage);

  const handleImport = (): void => {
    // TODO: Implement import functionality
  }
  const handleExport = (): void => {
    // TODO: Implement export functionality
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4">Carrier</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              color="inherit"
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleImport}
            >
              Import
            </Button>
            <Button
              color="inherit"
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      {/* <CustomersFilters /> */}
      <CarrierTable
        count={carrierContext.carrier?.length || 0}
        page={page}
        rows={paginatedCarrier}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  )
}

function applyPagination(rows: Carrier[], page: number, rowsPerPage: number): Carrier[] {
  return rows.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage);
}
