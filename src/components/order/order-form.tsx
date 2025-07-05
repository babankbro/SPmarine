// src/components/order/order-form.tsx
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
  Chip,
  Stack,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Package as PackageIcon,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Truck as TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useOrderContext } from "@/contexts/order-context";
import { Order, CreateOrderRequest, UpdateOrderRequest, OrderFormData } from "@/types/order";
import { Station } from "@/types/station";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  order?: Order;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

const initialFormData: OrderFormData = {
  id: '',
  type: 'EXPORT',
  fromPoint: '',
  destPoint: '',
  startStationId: '',
  destStationId: '',
  productName: '',
  demand: '',
  startDateTime: new Date().toISOString(),
  dueDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

export function OrderForm({ 
  open, 
  onClose, 
  order, 
  mode, 
  onSuccess, 
  onError, 
  embedded = false 
}: OrderFormProps) {
  const { createOrder, updateOrder, refreshData, isCreating, isUpdating, checkOrderExists } = useOrderContext();
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);
  const [stations, setStations] = useState<Station[]>([]);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        id: order.id,
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
      setIsIdValid(true);
      setHasIdBeenChecked(true);
    } else {
      setFormData({
        ...initialFormData,
        id: mode === 'create' ? `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : '',
      });
      setIsIdValid(true);
      setHasIdBeenChecked(false);
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

    // ID validation for create mode
    if (field === 'id' && mode === 'create') {
      setIsIdValid(true);
      setHasIdBeenChecked(false);
      
      if (value.trim() && /^[a-zA-Z0-9_-]+$/.test(value.trim())) {
        const timeoutId = setTimeout(() => {
          checkIdAvailability(value.trim());
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
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

  const checkIdAvailability = async (id: string): Promise<boolean> => {
    if (mode === 'edit') return true;

    setIdCheckLoading(true);
    try {
      const exists = await checkOrderExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This order ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check order ID:', error);
      setErrors(prev => ({ ...prev, id: 'Failed to check ID availability. Please try again.' }));
      setIsIdValid(false);
      return false;
    } finally {
      setIdCheckLoading(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.id.trim()) {
      newErrors.id = 'Order ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Order ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      if (!hasIdBeenChecked) {
        const isValid = await checkIdAvailability(formData.id.trim());
        if (!isValid) {
          newErrors.id = 'This order ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This order ID is already in use';
      }
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.fromPoint.trim()) {
      newErrors.fromPoint = 'From point is required';
    }

    if (!formData.destPoint.trim()) {
      newErrors.destPoint = 'Destination point is required';
    }

    if (!formData.startStationId) {
      newErrors.startStationId = 'Start station is required';
    }

    if (!formData.destStationId) {
      newErrors.destStationId = 'Destination station is required';
    }

    // Validate numbers
    const numberFields = [
      { field: 'demand', label: 'Demand', min: 1 },
      { field: 'loadingRate', label: 'Loading Rate', min: 0.1 },
    ];

    numberFields.forEach(({ field, label, min }) => {
      const value = formData[field as keyof OrderFormData];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = `${label} is required`;
      } else if (isNaN(Number(value))) {
        newErrors[field] = `${label} must be a valid number`;
      } else if (Number(value) < min) {
        newErrors[field] = `${label} must be at least ${min}`;
      }
    });

    // Date validation
    const startDate = new Date(formData.startDateTime);
    const dueDate = new Date(formData.dueDateTime);
    
    if (dueDate <= startDate) {
      newErrors.dueDateTime = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (mode === 'edit' || isIdValid);
  };

  const handleSubmit = async () => {
    const isFormValid = await validateForm();
    
    if (!isFormValid) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }

    if (mode === 'create' && (!isIdValid || !hasIdBeenChecked)) {
      setSubmitError('Please ensure the order ID is valid before submitting.');
      if (onError) onError('Please ensure the order ID is valid before submitting.');
      return;
    }

    setSubmitError('');

    try {
      if (mode === 'create') {
        const orderData: CreateOrderRequest = {
          id: formData.id.trim(),
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

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save order:', error);
      const errorMessage = error?.response?.data?.message || `Failed to ${mode} order. Please try again.`;
      setSubmitError(errorMessage);
      if (onError) onError(errorMessage);
    }
  };

  const isLoading = isCreating || isUpdating;

  const formContent = (
    <Box>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {/* ID validation status for create mode */}
      {mode === 'create' && formData.id.trim() && hasIdBeenChecked && (
        <Alert 
          severity={isIdValid ? "success" : "error"} 
          sx={{ mb: 2 }}
        >
          {isIdValid 
            ? "✅ Order ID is available!" 
            : "❌ Order ID is already in use. Please choose a different ID."
          }
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information Section */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PackageIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Order ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            error={!!errors.id}
            helperText={errors.id || (mode === 'create' ? 'Unique identifier for the order' : 'Order ID cannot be changed')}
            required
            disabled={mode === 'edit' || idCheckLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PackageIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange('type')}
              label="Order Type"
            >
              <MenuItem value="IMPORT">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PackageIcon size={20} />
                  <span>Import</span>
                </Stack>
              </MenuItem>
              <MenuItem value="EXPORT">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PackageIcon size={20} />
                  <span>Export</span>
                </Stack>
              </MenuItem>
            </Select>
            <FormHelperText>
              {errors.type || 'Type of shipment operation'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            value={formData.productName}
            onChange={handleInputChange('productName')}
            error={!!errors.productName}
            helperText={errors.productName || 'Name of the product being shipped'}
            required
          />
        </Grid>

        {/* Location Information Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Route Information
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="From Point"
            value={formData.fromPoint}
            onChange={handleInputChange('fromPoint')}
            error={!!errors.fromPoint}
            helperText={errors.fromPoint || 'Origin location'}
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
            helperText={errors.destPoint || 'Final destination'}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.startStationId}>
            <InputLabel>Start Station</InputLabel>
            <Select
              value={formData.startStationId}
              onChange={handleSelectChange('startStationId')}
              label="Start Station"
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationIcon size={16} />
                      <Typography>{station.name}</Typography>
                    </Stack>
                    <Chip
                      label={station.type}
                      color={station.type === 'SEA' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {errors.startStationId || 'Station where the journey begins'}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.destStationId}>
            <InputLabel>Destination Station</InputLabel>
            <Select
              value={formData.destStationId}
              onChange={handleSelectChange('destStationId')}
              label="Destination Station"
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationIcon size={16} />
                      <Typography>{station.name}</Typography>
                    </Stack>
                    <Chip
                      label={station.type}
                      color={station.type === 'SEA' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {errors.destStationId || 'Final destination station'}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Schedule & Capacity Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Schedule & Capacity
            </Typography>
          </Stack>
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
                helperText: errors.startDateTime || 'When the order should start',
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon size={20} />
                    </InputAdornment>
                  ),
                },
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
                helperText: errors.dueDateTime || 'When the order must be completed',
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
            helperText={errors.demand || 'Total quantity required'}
            required
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">units</InputAdornment>,
            }}
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
            helperText={errors.loadingRate || 'Loading capacity per hour'}
            required
            inputProps={{ min: 0.1, step: 0.1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">units/hour</InputAdornment>,
            }}
          />
        </Grid>

        {/* Cargo Requirements Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <TruckIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Cargo Requirements
            </Typography>
          </Stack>
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
                helperText={errors[`cr${num}`] || `Cargo requirement ${num} value`}
                inputProps={{ min: 0, step: 1 }}
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
                helperText={errors[`timeReadyCR${num}`] || `Ready time for CR${num} in hours`}
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        ))}

        {/* Form Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Summary:</strong> {mode === 'create' ? 'Creating' : 'Updating'} {formData.type} order for {formData.productName || 'product'} 
              with demand of {formData.demand || '0'} units at {formData.loadingRate || '0'} units/hour loading rate.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {!embedded && (
        <DialogActions sx={{ p: 2, mt: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isLoading || (mode === 'create' && !!errors.id)}
            size="large"
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating Order...' : 'Updating Order...') 
              : (mode === 'create' ? 'Create Order' : 'Update Order')
            }
          </Button>
        </DialogActions>
      )}

      {embedded && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={isLoading} size="large">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isLoading || (mode === 'create' && !!errors.id)}
            size="large"
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Order' : 'Update Order')
            }
          </Button>
        </Stack>
      )}
    </Box>
  );

  if (embedded) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {formContent}
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { 
            height: '95vh',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PackageIcon size={28} />
            <Typography variant="h5">
              {mode === 'create' ? 'Create New Order' : 'Edit Order'}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {mode === 'create' 
              ? 'Add a new order to your system with complete details' 
              : 'Update order information and operational details'
            }
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3, overflow: 'auto' }}>
          {formContent}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}