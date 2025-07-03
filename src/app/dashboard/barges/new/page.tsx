// src/app/dashboard/barges/new/page.tsx
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
  Boat as BoatIcon 
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { BargeForm } from "@/components/dashboard/barge/barge-form";
import { paths } from "@/paths";

export default function NewBargePage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const handleClose = () => {
    router.push(paths.dashboard.barges);
  };

  const handleSuccess = () => {
    router.push(paths.dashboard.barges);
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
          href={paths.dashboard.barges}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BoatIcon size={16} />
          Barges
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.barges)}>
          <BackIcon size={24} />
        </IconButton>
        <Box>
          <Typography variant="h4">Create New Barge</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new barge to your fleet with station assignments
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
            Barge Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in the barge details below. You can assign the barge to a station during creation.
          </Typography>
          
          {/* Embedded Form */}
          <BargeForm
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