// src/app/dashboard/stations/[id]/page.tsx
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
  Buildings as BuildingsIcon,
  Phone as PhoneIcon,
  Envelope as EmailIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Gauge as GaugeIcon,
} from "@phosphor-icons/react/dist/ssr";
import NextLink from "next/link";

import { useStation } from "@/hooks/use-station";
import { StationForm } from "@/components/dashboard/station/station-form";
import { Station } from "@/types/station";
import { paths } from "@/paths";

export default function StationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.id as string;
  
  const { getStationById, deleteStation, refreshData, isLoading, isDeleting } = useStation();
  const [station, setStation] = useState<Station | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStation = async () => {
      if (!stationId) return;
      
      try {
        const fetchedStation = await getStationById(stationId);
        if (fetchedStation) {
          setStation(fetchedStation);
          setError('');
        } else {
          setError('Station not found');
        }
      } catch (err) {
        console.error('Failed to fetch station:', err);
        setError('Failed to load station details');
      }
    };

    fetchStation();
  }, [stationId, getStationById]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!station) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete station "${station.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteStation(station.id);
      router.push(paths.dashboard.stations);
    } catch (error) {
      console.error('Failed to delete station:', error);
      alert('Failed to delete station');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (stationId) {
      try {
        const refreshedStation = await getStationById(stationId);
        if (refreshedStation) {
          setStation(refreshedStation);
        }
      } catch (error) {
        console.error('Failed to refresh station:', error);
      }
    }
  };

  const handleEditSuccess = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (stationId) {
      try {
        const refreshedStation = await getStationById(stationId);
        if (refreshedStation) {
          setStation(refreshedStation);
        }
      } catch (error) {
        console.error('Failed to refresh station:', error);
      }
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'MAINTENANCE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'SEA' ? 'primary' : 'secondary';
  };

  if (isLoading && !station) {
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
          <Button onClick={() => router.push(paths.dashboard.stations)} sx={{ ml: 2 }}>
            Back to Stations
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!station) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Station not found
          <Button onClick={() => router.push(paths.dashboard.stations)} sx={{ ml: 2 }}>
            Back to Stations
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
          href={paths.dashboard.stations}
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BuildingsIcon size={16} />
          Stations
        </Link>
        <Typography color="text.primary">{station.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push(paths.dashboard.stations)}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Station Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Station ID: {station.id}
            </Typography>
            <Chip
              label={station.type}
              color={getTypeColor(station.type)}
              size="small"
              icon={<BuildingsIcon size={16} />}
            />
          
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Station">
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Station">
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
                Station Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                 
                    <Typography variant="body2" color="text.secondary">
                      Capacity (tons)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {station.distanceKm?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distance (km)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {station.latitude?.toFixed(4) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latitude
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {station.longitude?.toFixed(4) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Longitude
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
                <BuildingsIcon size={24} />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Station Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {station.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Station Type
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BuildingsIcon size={16} />
                    <Typography variant="body1" fontWeight="medium">
                      {station.type} Station
                    </Typography>
                  </Stack>
                </Box>
                
                
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <LocationIcon size={24} />
                <Typography variant="h6">Location Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Coordinates
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {station.latitude?.toFixed(6)}, {station.longitude?.toFixed(6)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Distance from Origin
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {station.distanceKm} km
                  </Typography>
                </Box>

                
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <UserIcon size={24} />
                <Typography variant="h6">Contact Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              
            </CardContent>
          </Card>
        </Grid>

        {/* Important Dates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CalendarIcon size={24} />
                <Typography variant="h6">Important Dates</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Station Dialog */}
      {station && (
        <StationForm
          open={editDialogOpen}
          onClose={handleEditClose}
          station={station}
          mode="edit"
          onSuccess={handleEditSuccess}
        />
      )}
    </Box>
  );
}