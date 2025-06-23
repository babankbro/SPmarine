// src/components/dashboard/customer/customer-form.tsx
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
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { useCustomer } from "@/hooks/use-customer";
import { useStation } from "@/hooks/use-station";
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/types/customer";
import { Station } from "@/types/station";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  mode: 'create' | 'edit';
}

interface CustomerFormData {
  id: string;
  name: string;
  email: string;
  address: string;
  stationIds: string[];
}

const initialFormData: CustomerFormData = {
  id: '',
  name: '',
  email: '',
  address: '',
  stationIds: [],
};

export function CustomerForm({ open, onClose, customer, mode }: CustomerFormProps) {
  const { createCustomer, updateCustomer, refreshData, isCreating, isUpdating, checkCustomerExists } = useCustomer();
  const stations = useStation();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && customer) {
      setFormData({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        stationIds: customer.stations?.map(s => s.id) || [],
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setSubmitError('');
  }, [mode, customer, open]);

  const handleInputChange = (field: keyof CustomerFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check ID availability for create mode
    if (field === 'id' && mode === 'create' && value.trim()) {
      checkIdAvailability(value.trim());
    }
  };

  const handleStationChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({ 
      ...prev, 
      stationIds: typeof value === 'string' ? value.split(',') : value 
    }));
    
    if (errors.stationIds) {
      setErrors(prev => ({ ...prev, stationIds: '' }));
    }
  };

  const checkIdAvailability = async (id: string) => {
    setIdCheckLoading(true);
    try {
      const exists = await checkCustomerExists(id);
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This customer ID is already in use' }));
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
      }
    } catch (error) {
      console.error('Failed to check customer ID:', error);
    } finally {
      setIdCheckLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.id.trim()) {
      newErrors.id = 'Customer ID is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Customer ID can only contain letters, numbers, underscores, and hyphens';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
        const customerData: CreateCustomerRequest = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          stationIds: formData.stationIds,
        };

        await createCustomer(customerData);
      } else if (customer) {
        const customerData: UpdateCustomerRequest = {
          id: customer.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          stationIds: formData.stationIds,
        };

        await updateCustomer(customer.id, customerData);
      }

      onClose();
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      setSubmitError(error?.response?.data?.message || `Failed to ${mode} customer. Please try again.`);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Customer' : 'Edit Customer'}
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
              Customer Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer ID"
              value={formData.id}
              onChange={handleInputChange('id')}
              error={!!errors.id}
              helperText={errors.id || (mode === 'create' ? 'Unique identifier for the customer' : 'Customer ID cannot be changed')}
              required
              disabled={mode === 'edit' || idCheckLoading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!errors.address}
              helperText={errors.address}
              required
            />
          </Grid>

          {/* Station Associations */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>
              Station Associations
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.stationIds}>
              <InputLabel>Associated Stations</InputLabel>
              <Select
                multiple
                value={formData.stationIds}
                onChange={handleStationChange}
                input={<OutlinedInput label="Associated Stations" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((stationId) => {
                      const station = stations.find(s => s.id === stationId);
                      return (
                        <Chip 
                          key={stationId} 
                          label={station ? `${station.name} (${station.type})` : stationId}
                          color={station?.type === 'SEA' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {stations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>{station.name}</Typography>
                      <Chip 
                        label={station.type} 
                        color={station.type === 'SEA' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.stationIds && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.stationIds}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {formData.stationIds.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                This customer will be associated with {formData.stationIds.length} station(s).
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isLoading || (mode === 'create' && !!errors.id)}
        >
          {isLoading 
            ? (mode === 'create' ? 'Creating...' : 'Updating...') 
            : (mode === 'create' ? 'Create Customer' : 'Update Customer')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}