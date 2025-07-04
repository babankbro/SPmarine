// src/app/dashboard/carriers/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import { 
  ArrowLeft as BackIcon, 
  Anchor as ShipIcon 
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { CarrierForm } from "@/components/dashboard/carrier/carrier-form";
import { paths } from "@/paths";

export default function NewCarrierPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const handleClose = () => {
    router.push(paths.dashboard.carriers);
  };

  const handleSuccess = () => {
    router.push(paths.dashboard.carriers);
  };

  const handleError = (error: string) => {
    setSubmitError(error);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={NextLink}
          href={paths.dashboard.carriers}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ShipIcon size={16} />
          Carriers
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.carriers)}>
          <BackIcon size={24} />
        </IconButton>
        <Box>
          <Typography variant="h4">Create New Carrier</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new carrier to your fleet with complete specifications and company details
          </Typography>
        </Box>
      </Stack>

      {/* Error Display */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {/* Content Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Carrier Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in the carrier details below. All specifications and company information should be accurate for operational planning.
          </Typography>
          
          {/* Embedded Form */}
          <CarrierForm
            open={true}
            onClose={handleClose}
            mode="create"
            onSuccess={handleSuccess}
            onError={handleError}
            embedded={true}
          />
        </CardContent>
      </Card>
    </Box>
  );
}