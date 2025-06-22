
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useOrderContext, useStations } from "@/contexts/order-context";
import { Order, OrderFormData, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";


interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  order?: Order; // If provided, it's edit mode
  mode: 'create' | 'edit';
}

const initialFormData: OrderFormData = {
  type: 'EXPORT', // Default to EXPORT
  fromPoint: '',
  destPoint: '',
  startStationId: '',
  destStationId: '',
  productName: '',
  demand: '',
  startDateTime: new Date().toISOString(),
  dueDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  loadingRate: '',
  cr1: '0',
  cr2: '0',
  cr3: '0',
  cr4: '0',
  cr5: '0',
  cr6: '0',
  cr7: '0',
  timeReadyCR1: '0',
  timeReadyCR2: '0',
  timeReadyCR3: '0',
  timeReadyCR4: '0',
  timeReadyCR5: '0',
  timeReadyCR6: '0',
  timeReadyCR7: '0',
};

export function OrderForm({ open, onClose, order, mode }: OrderFormProps) {
  const { createOrder, updateOrder, refreshData, isCreating, isUpdating } = useOrderContext();
  const stations = useStations();
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        type: order.type,
        fromPoint: order.fromPoint,
        destPoint: order.destPoint,
        startStationId: order.startStationId,
        destStationId: order.destStationId,
        productName: order.productName,
        demand: order.demand.toString(),
        startDateTime: typeof order.startDateTime === 'string' ? order.startDateTime : order.startDateTime.toISOString(),
        dueDateTime: typeof order.dueDateTime === 'string' ? order.dueDateTime : order.dueDateTime.toISOString(),
        loadingRate: order.loadingRate.toString(),
        cr1: order.cr1.toString(),
        cr2: order.cr2.toString(),
        cr3: order.cr3.toString(),
        cr4: order.cr4.toString(),
        cr5: order.cr5.toString(),
        cr6: order.cr6.toString(),
        cr7: order.cr7.toString(),
        timeReadyCR1: order.timeReadyCR1.toString(),
        timeReadyCR2: order.timeReadyCR2.toString(),
        timeReadyCR3: order.timeReadyCR3.toString(),
        timeReadyCR4: order.timeReadyCR4.toString(),
        timeReadyCR5: order.timeReadyCR5.toString(),
        timeReadyCR6: order.timeReadyCR6.toString(),
        timeReadyCR7: order.timeReadyCR7.toString(),
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setSubmitError('');
  }, [mode, order, open]);

  const handleInputChange = (field: keyof OrderFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: keyof OrderFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (field: 'startDateTime' | 'dueDateTime') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date.toISOString() }));
      
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required string fields
    const requiredFields = [
      'fromPoint', 'destPoint', 'startStationId', 'destStationId', 
      'productName', 'demand', 'loadingRate'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof OrderFormData] || formData[field as keyof OrderFormData].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate numbers
    const numberFields = [
      'demand', 'loadingRate', 'cr1', 'cr2', 'cr3', 'cr4', 'cr5', 'cr6', 'cr7',
      'timeReadyCR1', 'timeReadyCR2', 'timeReadyCR3', 'timeReadyCR4', 
      'timeReadyCR5', 'timeReadyCR6', 'timeReadyCR7'
    ];
    
    numberFields.forEach(field => {
      const value = formData[field as keyof OrderFormData];
      if (value && isNaN(Number(value))) {
        newErrors[field] = 'Must be a valid number';
      }
      if (field === 'demand' || field === 'loadingRate') {
        if (value && Number(value) <= 0) {
          newErrors[field] = 'Must be greater than 0';
        }
      }
    });

    // Validate dates
    const startDate = new Date(formData.startDateTime);
    const dueDate = new Date(formData.dueDateTime);
    
    if (dueDate <= startDate) {
      newErrors.dueDateTime = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitError('');

    try {
      
      if (mode === 'create') {
        const orderData: CreateOrderRequest = {
        type: formData.type,
        fromPoint: formData.fromPoint.trim(),
        destPoint: formData.destPoint.trim(),
        startStationId: formData.startStationId,
        destStationId: formData.destStationId,
        productName: formData.productName.trim(),
        demand: Number(formData.demand),
        startDateTime: formData.startDateTime,
        dueDateTime: formData.dueDateTime,
        loadingRate: Number(formData.loadingRate),
        cr1: Number(formData.cr1),
        cr2: Number(formData.cr2),
        cr3: Number(formData.cr3),
        cr4: Number(formData.cr4),
        cr5: Number(formData.cr5),
        cr6: Number(formData.cr6),
        cr7: Number(formData.cr7),
        timeReadyCR1: Number(formData.timeReadyCR1),
        timeReadyCR2: Number(formData.timeReadyCR2),
        timeReadyCR3: Number(formData.timeReadyCR3),
        timeReadyCR4: Number(formData.timeReadyCR4),
        timeReadyCR5: Number(formData.timeReadyCR5),
        timeReadyCR6: Number(formData.timeReadyCR6),
        timeReadyCR7: Number(formData.timeReadyCR7),
      };

        await createOrder(orderData);
      } else if (order) {

        const orderData: UpdateOrderRequest = {
        id: order.id,
        type: formData.type,
        fromPoint: formData.fromPoint.trim(),
        destPoint: formData.destPoint.trim(),
        startStationId: formData.startStationId,
        destStationId: formData.destStationId,
        productName: formData.productName.trim(),
        demand: Number(formData.demand),
        startDateTime: formData.startDateTime,
        dueDateTime: formData.dueDateTime,
        loadingRate: Number(formData.loadingRate),
        cr1: Number(formData.cr1),
        cr2: Number(formData.cr2),
        cr3: Number(formData.cr3),
        cr4: Number(formData.cr4),
        cr5: Number(formData.cr5),
        cr6: Number(formData.cr6),
        cr7: Number(formData.cr7),
        timeReadyCR1: Number(formData.timeReadyCR1),
        timeReadyCR2: Number(formData.timeReadyCR2),
        timeReadyCR3: Number(formData.timeReadyCR3),
        timeReadyCR4: Number(formData.timeReadyCR4),
        timeReadyCR5: Number(formData.timeReadyCR5),
        timeReadyCR6: Number(formData.timeReadyCR6),
        timeReadyCR7: Number(formData.timeReadyCR7),
      };

        await updateOrder(order.id, orderData);
      }

      onClose();
    } catch (error: any) {
      console.error('Failed to save order:', error);
      setSubmitError(error?.response?.data?.message || `Failed to ${mode} order. Please try again.`);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          {mode === 'create' ? 'Create New Order' : 'Edit Order'}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Order Type"
                  onChange={handleSelectChange('type')}
                >
                  <MenuItem value="IMPORT">Import</MenuItem>
                  <MenuItem value="EXPORT">Export</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.productName}
                onChange={handleInputChange('productName')}
                error={!!errors.productName}
                helperText={errors.productName}
                required
              />
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Point"
                value={formData.fromPoint}
                onChange={handleInputChange('fromPoint')}
                error={!!errors.fromPoint}
                helperText={errors.fromPoint}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination Point"
                value={formData.destPoint}
                onChange={handleInputChange('destPoint')}
                error={!!errors.destPoint}
                helperText={errors.destPoint}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.startStationId}>
                <InputLabel>Start Station</InputLabel>
                <Select
                  value={formData.startStationId}
                  label="Start Station"
                  onChange={handleSelectChange('startStationId')}
                >
                  {stations.map((station) => (
                    <MenuItem key={station.id} value={station.id}>
                      {station.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.startStationId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.startStationId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.destStationId}>
                <InputLabel>Destination Station</InputLabel>
                <Select
                  value={formData.destStationId}
                  label="Destination Station"
                  onChange={handleSelectChange('destStationId')}
                >
                  {stations.map((station) => (
                    <MenuItem key={station.id} value={station.id}>
                      {station.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.destStationId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.destStationId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Schedule Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Schedule & Capacity
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Date & Time"
                value={new Date(formData.startDateTime)}
                onChange={handleDateChange('startDateTime')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDateTime,
                    helperText: errors.startDateTime,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Due Date & Time"
                value={new Date(formData.dueDateTime)}
                onChange={handleDateChange('dueDateTime')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dueDateTime,
                    helperText: errors.dueDateTime,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Demand"
                value={formData.demand}
                onChange={handleInputChange('demand')}
                error={!!errors.demand}
                helperText={errors.demand}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Loading Rate"
                value={formData.loadingRate}
                onChange={handleInputChange('loadingRate')}
                error={!!errors.loadingRate}
                helperText={errors.loadingRate}
                required
              />
            </Grid>

            {/* Cargo Requirements */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Cargo Requirements
              </Typography>
            </Grid>

            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <Grid container spacing={2} key={num} item xs={12}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`CR${num} Value`}
                    value={formData[`cr${num}` as keyof OrderFormData]}
                    onChange={handleInputChange(`cr${num}` as keyof OrderFormData)}
                    error={!!errors[`cr${num}`]}
                    helperText={errors[`cr${num}`]}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Time Ready CR${num}`}
                    value={formData[`timeReadyCR${num}` as keyof OrderFormData]}
                    onChange={handleInputChange(`timeReadyCR${num}` as keyof OrderFormData)}
                    error={!!errors[`timeReadyCR${num}`]}
                    helperText={errors[`timeReadyCR${num}`]}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Order' : 'Update Order')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}