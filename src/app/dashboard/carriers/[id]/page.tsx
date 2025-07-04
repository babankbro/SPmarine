// src/app/dashboard/carriers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ArrowLeft as BackIcon,
  PencilSimple as EditIcon,
  Trash as DeleteIcon,
  Anchor  as ShipIcon,
  Factory as FactoryIcon,
  Gauge as GaugeIcon,
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { useCarrier } from "@/hooks/use-carrier";
import { CarrierForm } from "@/components/dashboard/carrier/carrier-form";
import { Carrier } from "@/types/carrier";
import { paths } from "@/paths";

export default function CarrierDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const carrierId = params.id as string;
  
  const { getCarrierById, deleteCarrier, refreshData, isLoading, isDeleting } = useCarrier();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCarrier = async () => {
      if (!carrierId) return;
      
      try {
        const fetchedCarrier = await getCarrierById(carrierId);
        if (fetchedCarrier) {
          setCarrier(fetchedCarrier);
          setError('');
        } else {
          setError('Carrier not found');
        }
      } catch (err) {
        console.error('Failed to fetch carrier:', err);
        setError('Failed to load carrier details');
      }
    };

    fetchCarrier();
  }, [carrierId, getCarrierById]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!carrier) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete carrier "${carrier.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteCarrier(carrier.id);
      router.push(paths.dashboard.carriers);
    } catch (error) {
      console.error('Failed to delete carrier:', error);
      alert('Failed to delete carrier');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (carrierId) {
      try {
        const refreshedCarrier = await getCarrierById(carrierId);
        if (refreshedCarrier) {
          setCarrier(refreshedCarrier);
        }
      } catch (error) {
        console.error('Failed to refresh carrier:', error);
      }
    }
  };

  const handleEditSuccess = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (carrierId) {
      try {
        const refreshedCarrier = await getCarrierById(carrierId);
        if (refreshedCarrier) {
          setCarrier(refreshedCarrier);
        }
      } catch (error) {
        console.error('Failed to refresh carrier:', error);
      }
    }
  };

  if (isLoading && !carrier) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
          <Button onClick={() => router.push(paths.dashboard.carriers)} sx={{ ml: 2 }}>
            Back to Carriers
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!carrier) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Carrier not found
          <Button onClick={() => router.push(paths.dashboard.carriers)} sx={{ ml: 2 }}>
            Back to Carriers
          </Button>
        </Alert>
      </Box>
    );
  }

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
        <Typography color="text.primary">{carrier.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.carriers)}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Carrier Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Carrier ID: {carrier.id}
            </Typography>
            {carrier.holder && (
              <Chip
                label={carrier.holder}
                color="primary"
                size="small"
                icon={<FactoryIcon size={16} />}
              />
            )}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Carrier">
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Carrier">
            <IconButton onClick={handleDelete} color="error" disabled={isDeleting}>
              <DeleteIcon size={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carrier Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {carrier.maxCapacity?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Capacity (tons)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {carrier.numberOfBulks || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compartments
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {carrier.maxCrane || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Cranes
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {carrier.holder ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Company Assigned
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <ShipIcon size={24} />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Carrier Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {carrier.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Carrier ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                    {carrier.id}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Operating Company
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FactoryIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {carrier.holder || 'Not specified'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Specifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <GaugeIcon size={24} />
                <Typography variant="h6">Specifications</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Maximum Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {carrier.maxCapacity ? `${carrier.maxCapacity.toLocaleString()} tons` : 'Not specified'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Number of Compartments
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {carrier.numberOfBulks ? `${carrier.numberOfBulks} compartments` : 'Not specified'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Maximum Cranes
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {carrier.maxCrane ? `${carrier.maxCrane} cranes` : 'Not specified'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Carrier Dialog */}
      {carrier && (
        <CarrierForm
          open={editDialogOpen}
          onClose={handleEditClose}
          carrier={carrier}
          mode="edit"
          onSuccess={handleEditSuccess}
        />
      )}
    </Box>
  );
}