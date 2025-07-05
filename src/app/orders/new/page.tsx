// src/app/orders/new/page.tsx
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
  Package as PackageIcon 
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { OrderForm } from "@/components/order/order-form";
import { paths } from "@/paths";

export default function NewOrderPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const handleClose = () => {
    router.push('/orders');
  };

  const handleSuccess = () => {
    router.push('/orders');
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
          href="/orders"
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PackageIcon size={16} />
          Orders
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push('/orders')}>
          <BackIcon size={24} />
        </IconButton>
        <Box>
          <Typography variant="h4">Create New Order</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new order to your system with station assignments
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
            Order Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in the order details below. You can assign start and destination stations during creation.
          </Typography>
          
          {/* Embedded Form */}
          <OrderForm
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