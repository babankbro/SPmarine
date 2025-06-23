// src/app/dashboard/customers/[id]/page.tsx
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
  User as UserIcon,
  Envelope as EmailIcon,
  Buildings as BuildingsIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useCustomer } from "@/hooks/use-customer";
import { CustomerForm } from "@/components/dashboard/customer/customer-form";
import { Customer } from "@/types/customer";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const { getCustomerById, deleteCustomer, refreshData, isLoading, isDeleting } = useCustomer();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      try {
        const fetchedCustomer = await getCustomerById(customerId);
        if (fetchedCustomer) {
          setCustomer(fetchedCustomer);
          setError('');
        } else {
          setError('Customer not found');
        }
      } catch (err) {
        console.error('Failed to fetch customer:', err);
        setError('Failed to load customer details');
      }
    };

    fetchCustomer();
  }, [customerId, getCustomerById]);

  const handleEdit = () => {
    setEditDialogOpen(true);
    refreshData();
  };

  const handleDelete = async () => {
    if (!customer) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteCustomer(customer.id);
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData();
    if (customerId) {
      try {
        const refreshedCustomer = await getCustomerById(customerId);
        if (refreshedCustomer) {
          setCustomer(refreshedCustomer);
        }
      } catch (error) {
        console.error('Failed to refresh customer:', error);
      }
    }
  };

  if (isLoading && !customer) {
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
          <Button onClick={() => router.push('/dashboard/customers')} sx={{ ml: 2 }}>
            Back to Customers
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Customer not found
          <Button onClick={() => router.push('/dashboard/customers')} sx={{ ml: 2 }}>
            Back to Customers
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push('/dashboard/customers')}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Customer Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Customer ID: {customer.id}
            </Typography>
            <Tooltip title="Edit Customer">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton onClick={handleDelete} color="error" disabled={isDeleting}>
                <DeleteIcon size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <UserIcon size={24} />
                <Typography variant="h6">Customer Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BuildingsIcon size={16} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.address}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Station Associations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <LocationIcon size={24} />
                <Typography variant="h6">Associated Stations</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              {customer.stations && customer.stations.length > 0 ? (
                <Stack spacing={1}>
                  {customer.stations.map((station) => (
                    <Card key={station.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {station.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {station.id} • Type: {station.type}
                          </Typography>
                          {station.latitude && station.longitude && (
                            <Typography variant="caption" color="text.secondary">
                              Location: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                            </Typography>
                          )}
                        </Box>
                        <Chip 
                          label={station.type} 
                          color={station.type === 'SEA' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  No stations associated with this customer
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {customer.stations?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Associated Stations
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {customer.stations?.filter(s => s.type === 'SEA').length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sea Stations
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {customer.stations?.filter(s => s.type === 'RIVER').length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      River Stations
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      Active
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Customer Dialog */}
      {customer && (
        <CustomerForm
          open={editDialogOpen}
          onClose={handleEditClose}
          customer={customer}
          mode="edit"
        />
      )}
    </Box>
  );
}