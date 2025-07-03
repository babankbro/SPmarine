// src/app/dashboard/tugboats/[id]/page.tsx
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
  MapPin as LocationIcon,
  Boat as BoatIcon,
  Anchor as AnchorIcon,
  Compass as CompassIcon,
  Gauge as GaugeIcon,
  Clock as ClockIcon,
  Engine as EngineIcon,
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { useTugboat } from "@/hooks/use-tugboat";
import { TugboatForm } from "@/components/dashboard/tugboat/tugboat-form";
import { Tugboat } from "@/types/tugboat";
import { paths } from "@/paths";

export default function TugboatDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tugboatId = params.id as string;
  
  const { getTugboatById, deleteTugboat, refreshData, isLoading, isDeleting } = useTugboat();
  const [tugboat, setTugboat] = useState<Tugboat | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTugboat = async () => {
      if (!tugboatId) return;
      
      try {
        const fetchedTugboat = await getTugboatById(tugboatId);
        if (fetchedTugboat) {
          setTugboat(fetchedTugboat);
          setError('');
        } else {
          setError('Tugboat not found');
        }
      } catch (err) {
        console.error('Failed to fetch tugboat:', err);
        setError('Failed to load tugboat details');
      }
    };

    fetchTugboat();
  }, [tugboatId, getTugboatById]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tugboat) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete tugboat "${tugboat.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteTugboat(tugboat.id);
      router.push(paths.dashboard.tugboats);
    } catch (error) {
      console.error('Failed to delete tugboat:', error);
      alert('Failed to delete tugboat');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (tugboatId) {
      try {
        const refreshedTugboat = await getTugboatById(tugboatId);
        if (refreshedTugboat) {
          setTugboat(refreshedTugboat);
        }
      } catch (error) {
        console.error('Failed to refresh tugboat:', error);
      }
    }
  };

  const handleEditSuccess = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (tugboatId) {
      try {
        const refreshedTugboat = await getTugboatById(tugboatId);
        if (refreshedTugboat) {
          setTugboat(refreshedTugboat);
        }
      } catch (error) {
        console.error('Failed to refresh tugboat:', error);
      }
    }
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadyStatus = (tugboat: Tugboat) => {
    const now = new Date();
    const readyDate = new Date(tugboat.readyDatetime || new Date());
    
    if (readyDate <= now) {
      return { status: 'Ready', color: 'success' as const };
    } else {
      return { status: 'Scheduled', color: 'warning' as const };
    }
  };

  const getWaterStatusColor = (waterStatus: string) => {
    return waterStatus === 'SEA' ? 'primary' : 'secondary';
  };

  if (isLoading && !tugboat) {
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
          <Button onClick={() => router.push(paths.dashboard.tugboats)} sx={{ ml: 2 }}>
            Back to Tugboats
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!tugboat) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Tugboat not found
          <Button onClick={() => router.push(paths.dashboard.tugboats)} sx={{ ml: 2 }}>
            Back to Tugboats
          </Button>
        </Alert>
      </Box>
    );
  }

  const readyStatusInfo = getReadyStatus(tugboat);

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={NextLink}
          href={paths.dashboard.tugboats}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BoatIcon size={16} />
          Tugboats
        </Link>
        <Typography color="text.primary">{tugboat.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.tugboats)}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Tugboat Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Tugboat ID: {tugboat.id}
            </Typography>
            <Chip
              label={tugboat.waterStatus}
              color={getWaterStatusColor(tugboat.waterStatus)}
              size="small"
              icon={<BoatIcon size={16} />}
            />
            <Chip
              label={readyStatusInfo.status}
              color={readyStatusInfo.color}
              size="small"
              icon={<ClockIcon size={16} />}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Tugboat">
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Tugboat">
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
                Tugboat Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {tugboat.maxCapacity?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Capacity
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {tugboat.maxBarge || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Barges
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {tugboat.horsePower?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Horse Power
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {tugboat.maxSpeed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Speed (knots)
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
                <BoatIcon size={24} />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tugboat Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BoatIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {tugboat.type}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Water Status
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CompassIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {tugboat.waterStatus}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ready Date & Time
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ClockIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {tugboat.readyDatetime ? formatDateTime(tugboat.readyDatetime) : 'Not set'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Engine Specifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <EngineIcon size={24} />
                <Typography variant="h6">Engine Specifications</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EngineIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Horse Power
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.horsePower?.toLocaleString() || 0} HP
                  </Typography>
                </Box>
                
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GaugeIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Engine RPM
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.engineRpm?.toLocaleString() || 0} RPM
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Fuel Consumption
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.maxFuelCon || 0} L/h
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance & Capacity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <GaugeIcon size={24} />
                <Typography variant="h6">Performance & Capacity</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Speed Range
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.minSpeed || 0} - {tugboat.maxSpeed || 0} knots
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.maxCapacity?.toLocaleString() || 0} tons
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Barges
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.maxBarge || 0} barges
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Location & Station */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <LocationIcon size={24} />
                <Typography variant="h6">Location & Station</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Station Assignment
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {tugboat.station ? (
                      `${tugboat.station.name} (${tugboat.station.id})`
                    ) : (
                      'Not assigned to any station'
                    )}
                  </Typography>
                </Box>
                
                {tugboat.station && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Station Type
                    </Typography>
                    <Chip
                      label={tugboat.station.type}
                      color={tugboat.station.type === 'SEA' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Tugboat Dialog */}
      {tugboat && (
        <TugboatForm
          open={editDialogOpen}
          onClose={handleEditClose}
          tugboat={tugboat}
          mode="edit"
          onSuccess={handleEditSuccess}
        />
      )}
    </Box>
  );
}