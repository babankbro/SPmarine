// src/app/dashboard/stations/new/page.tsx
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
  Buildings as BuildingsIcon 
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { StationForm } from "@/components/dashboard/station/station-form";
import { paths } from "@/paths";

export default function NewStationPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const handleClose = () => {
    router.push(paths.dashboard.stations);
  };

  const handleSuccess = () => {
    router.push(paths.dashboard.stations);
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
          href={paths.dashboard.stations}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BuildingsIcon size={16} />
          Stations
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.stations)}>
          <BackIcon size={24} />
        </IconButton>
        <Box>
          <Typography variant="h4">Create New Station</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new station to your network with complete location and operational details
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
            Station Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in the station details below. All location coordinates and operational information should be accurate.
          </Typography>
          
          {/* Embedded Form */}
          <StationForm
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