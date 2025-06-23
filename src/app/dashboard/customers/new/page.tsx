// src/app/dashboard/customers/new/page.tsx
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
} from "@mui/material";
import { ArrowLeft as BackIcon } from "@phosphor-icons/react/dist/ssr";

import { CustomerForm } from "@/components/dashboard/customer/customer-form";

export default function NewCustomerPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleClose = () => {
    setIsDialogOpen(false);
    router.push('/dashboard/customers');
  };

  const handleSuccess = () => {
    router.push('/dashboard/customers');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push('/dashboard/customers')}>
          <BackIcon size={24} />
        </IconButton>
        <Typography variant="h4">
          Create New Customer
        </Typography>
      </Stack>

      {/* Content Card */}
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Fill in the customer information below. You can associate the customer with stations after creation.
          </Typography>
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <CustomerForm
        open={isDialogOpen}
        onClose={handleClose}
        mode="create"
      />
    </Box>
  );
}