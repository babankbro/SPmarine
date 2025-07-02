// src/app/dashboard/barges/[id]/page.tsx
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
  Barbell as BarbellIcon, // Use Barbell instead of Scale for weight
} from "@phosphor-icons/react/dist/ssr";

import { useBarge } from "@/hooks/use-barge";
import { BargeForm } from "@/components/dashboard/barge/barge-form";
import { Barge } from "@/types/barge";

export default function BargeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bargeId = params.id as string;
  
  const { getBargeById, deleteBarge, refreshData, isLoading, isDeleting } = useBarge();
  const [barge, setBarge] = useState<Barge | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBarge = async () => {
      if (!bargeId) return;
      
      try {
        const fetchedBarge = await getBargeById(bargeId);
        if (fetchedBarge) {
          setBarge(fetchedBarge);
          setError('');
        } else {
          setError('Barge not found');
        }
      } catch (err) {
        console.error('Failed to fetch barge:', err);
        setError('Failed to load barge details');
      }
    };

    fetchBarge();
  }, [bargeId, getBargeById]);

  const handleEdit = () => {
    setEditDialogOpen(true);
    refreshData();
  };

  const handleDelete = async () => {
    if (!barge) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete barge "${barge.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteBarge(barge.id);
      router.push('/dashboard/barges');
    } catch (error) {
      console.error('Failed to delete barge:', error);
      alert('Failed to delete barge');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (bargeId) {
      try {
        const refreshedBarge = await getBargeById(bargeId);
        if (refreshedBarge) {
          setBarge(refreshedBarge);
        }
      } catch (error) {
        console.error('Failed to refresh barge:', error);
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

  const getReadyStatus = (barge: Barge) => {
    const now = new Date();
    const readyDate = new Date(barge.readyDatetime);
    
    if (readyDate <= now) {
      return { status: 'Ready', color: 'success' as const };
    } else {
      return { status: 'Scheduled', color: 'warning' as const };
    }
  };

  const getWaterStatusColor = (waterStatus: string) => {
    return waterStatus === 'SEA' ? 'primary' : 'secondary';
  };

  if (isLoading && !barge) {
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
          <Button onClick={() => router.push('/dashboard/barges')} sx={{ ml: 2 }}>
            Back to Barges
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!barge) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Barge not found
          <Button onClick={() => router.push('/dashboard/barges')} sx={{ ml: 2 }}>
            Back to Barges
          </Button>
        </Alert>
      </Box>
    );
  }

  const readyStatusInfo = getReadyStatus(barge);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push('/dashboard/barges')}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Barge Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Barge ID: {barge.id}
            </Typography>
            <Chip
              label={barge.waterStatus}
              color={getWaterStatusColor(barge.waterStatus)}
              size="small"
              icon={<BoatIcon size={16} />}
            />
            <Chip
              label={readyStatusInfo.status}
              color={readyStatusInfo.color}
              size="small"
              icon={<ClockIcon size={16} />}
            />
            <Tooltip title="Edit Barge">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Barge">
              <IconButton onClick={handleDelete} color="error" disabled={isDeleting}>
                <DeleteIcon size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
      {/* Summary Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Barge Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {barge.weight.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weight (tons)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {barge.capacity.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Capacity (tons)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {barge.setupTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Setup Minutes
                    </Typography>
                  </Box>
                </Grid>
                
                
              </Grid>
            </CardContent>
          </Card>
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
                    Barge Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Water Status
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BoatIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {barge.waterStatus}
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
                      {formatDateTime(barge.readyDatetime)}
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BarbellIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Weight
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.weight.toLocaleString()} tons
                  </Typography>
                </Box>
                
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GaugeIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Capacity
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.capacity.toLocaleString()} tons
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Setup Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.setupTime} minutes
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
                    Station ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.stationId || 'Not assigned'} {barge.station ? `(${barge.station.name})` : ''}
                  </Typography>
                </Box>
                
                {barge.latitude && barge.longitude && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CompassIcon size={16} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Coordinates
                      </Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight="medium">
                      {barge.latitude.toFixed(4)}, {barge.longitude.toFixed(4)}
                    </Typography>
                  </Box>
                )}
                
                {(barge.distanceKm? barge.distanceKm > 0 : false ) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Distance
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {barge.distanceKm} km
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

        </Grid>

       <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
	
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <LocationIcon size={24} />
                <Typography variant="h6">River Distance</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {barge.station ?.type === 'RIVER' ? 'Is in River'  : 'Is not in River'}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {barge.station ?.type === 'RIVER' ? barge.station.distanceKm : 0} km
                  </Typography>
                </Box>
                
                {barge.latitude && barge.longitude && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CompassIcon size={16} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Coordinates
                      </Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight="medium">
                      {barge.latitude.toFixed(4)}, {barge.longitude.toFixed(4)}
                    </Typography>
                  </Box>
                )}
                
                {(barge.distanceKm? barge.distanceKm > 0 : false ) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Distance
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {barge.distanceKm} km
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

        </Grid>

        
      </Grid>

      {/* Edit Barge Dialog */}
      {barge && (
        <BargeForm
          open={editDialogOpen}
          onClose={handleEditClose}
          barge={barge}
          mode="edit"
        />
      )}
    </Box>
  );
}