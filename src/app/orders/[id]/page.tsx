// app/orders/[id]/page.tsx
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
  Calendar as CalendarIcon,
  MapPin as LocationIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useOrderContext } from "@/contexts/order-context";
import { OrderForm } from "@/components/order/order-form";
import { Order } from "@/types/order";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const { getById, deleteById, refreshData, isLoading, isDeleting } = useOrderContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const fetchedOrder = await getById(orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          setError('');
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      }
    };

    fetchOrder();
  }, [orderId, getById]);

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

  const getStatusInfo = (order: Order) => {
    const now = new Date();
    const startDate = new Date(order.startDateTime);
    const dueDate = new Date(order.dueDateTime);
    
    if (dueDate < now) {
      return { status: 'Overdue', color: 'error' as const };
    } else if (startDate <= now && dueDate >= now) {
      return { status: 'In Progress', color: 'warning' as const };
    } else {
      return { status: 'Scheduled', color: 'success' as const };
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    refreshData(); // Ensure we have the latest data before editing
  };

  const handleDelete = async () => {
    if (!order) return;
    
    try {
      await deleteById(order.id);
      router.push('/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  const handleEditClose = async () => {
    setEditDialogOpen(false);
    refreshData(); // Ensure we have the latest data before editing
    if (orderId) {
      try {
        const refreshedOrder = await getById(orderId);
        if (refreshedOrder) {
          setOrder(refreshedOrder);
        }
      } catch (error) {
        console.error('Failed to refresh order:', error);
      }
    }
  };

  if (isLoading && !order) {
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
          <Button onClick={() => router.push('/orders')} sx={{ ml: 2 }}>
            Back to Orders
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Order not found
          <Button onClick={() => router.push('/orders')} sx={{ ml: 2 }}>
            Back to Orders
          </Button>
        </Alert>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(order);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push('/orders')}>
          <BackIcon size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
            Order Details
          </Typography>
          <Stack direction="row" spacing={2}>
          
          <Typography variant="body2" color="text.secondary">
            Order ID: {order.id}
          </Typography>
          <Tooltip title="Edit Order">
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Order">
            <IconButton onClick={handleDelete} color="error" disabled={isDeleting}>
              <DeleteIcon size={20} />
            </IconButton>
          </Tooltip>
          </Stack>
        </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          
        {/* Status and Type */}
     

      <Grid container spacing={3}>
        {/* Additional Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
               <Chip
                label={'Category Shipment:' + order.type.toUpperCase()}
                color={order.type === 'IMPORT' ? 'primary' : 'secondary'}
                size="medium"
                />
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {order.demand.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Demand
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {order.loadingRate.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loading Rate/Hour
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {Math.ceil(order.demand / order.loadingRate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Hours
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {[order.cr1, order.cr2, order.cr3, order.cr4, order.cr5, order.cr6, order.cr7]
                        .reduce((sum, cr) => sum + cr, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total CR Value
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PackageIcon size={24} />
                <Typography variant="h6">Product Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Product Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.productName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Demand
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.demand.toLocaleString()} units
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loading Rate
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.loadingRate.toLocaleString()} units/hour
                  </Typography>
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
                <Typography variant="h6">Route Information</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    From Point
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.fromPoint}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Destination Point
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.destPoint}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Station ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.startStationId}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Destination Station ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.destStationId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CalendarIcon size={24} />
                <Typography variant="h6">Schedule</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDateTime(order.startDateTime)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDateTime(order.dueDateTime)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {Math.ceil(
                      (new Date(order.dueDateTime).getTime() - new Date(order.startDateTime).getTime()) 
                      / (1000 * 60 * 60 * 24)
                    )} days
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Cargo Requirements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <TruckIcon size={24} />
                <Typography variant="h6">Cargo Requirements</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Grid item xs={12} sm={6} key={num}>
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        CR{num}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          Value: {order[`cr${num}` as keyof Order] as number}
                        </Typography>
                        <Typography variant="body2">
                          Ready: {order[`timeReadyCR${num}` as keyof Order] as number}h
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        
      </Grid>

      {/* Edit Order Dialog */}
      {order && (
        <OrderForm
          open={editDialogOpen}
          onClose={handleEditClose}
          order={order}
          mode="edit"
        />
      )}
    
      </Stack>

      

      {/* Edit Order Dialog */}
      {order && (
        <OrderForm
          open={editDialogOpen}
          onClose={handleEditClose}
          order={order}
          mode="edit"
        />
      )}
    </Box>
    );
  };
