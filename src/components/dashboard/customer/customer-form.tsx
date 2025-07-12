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
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerFormData } from "@/types/customer";
import BasicSearchableStationSelect  from  "@/components/core/search/station-search-selected";
import { Station } from "@/types/station";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  mode: 'create' | 'edit';
}


const initialFormData: CustomerFormData = {
  id: '',
  name: '',
  email: '',
  address: '',
  stationId: '', // Changed from stationIds: []
  station: undefined, // Optional station object for edit mode
};

export function CustomerForm({ open, onClose, customer, mode }: CustomerFormProps) {
  const { createCustomer, updateCustomer, refreshData, isCreating, isUpdating, checkCustomerExists } = useCustomer();
  const {
  data: stations,
  isLoading: isStationsLoading,
  isError: isStationsError,
  error: stationsError
} = useStation();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);

    // Reset validation states when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && customer) {
      // FIX 1: Properly populate form data in edit mode
      const stationId = customer.station 
        ? customer.station.id 
        :  '';
      
      setFormData({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        stationId: stationId,
        station: customer.station
      });
      setIsIdValid(true);
      setHasIdBeenChecked(true); // In edit mode, ID is always valid
    } else {
      setFormData(initialFormData);
      setIsIdValid(true);
      setHasIdBeenChecked(false);
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
    //setIsIdValid(true);
    
    // // Reset ID validation states when ID changes
    // if (field === 'id' && mode === 'create') {
    //   setIsIdValid(true);
    //   setHasIdBeenChecked(false);
      
    //   // Debounced ID check (optional - check after user stops typing for 500ms)
    //   if (value.trim() && /^[a-zA-Z0-9_-]+$/.test(value.trim())) {
    //     const timeoutId = setTimeout(() => {
    //       checkIdAvailability(value.trim());
    //     }, 3000);
        
    //     return () => clearTimeout(timeoutId);
    //   }
    // }
  };

  const handleStationChange = (event:React.SyntheticEvent<Element, Event>, station: Station ) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(" Station changed:", value, station)
    setFormData(prev => ({ 
      ...prev, 
      stationId: station?.id ||'', 
      station: stations.find(station => station.id === value) || undefined
    }));
    
    if (errors.stationId) {
      setErrors(prev => ({ ...prev, stationId: '' }));
    }
  };
  
  const handleErrorClear = () => {
    setErrors(prev => ({ ...prev, stationId: '' }));
  };

  const checkIdAvailability = async (id: string): Promise<boolean> => {
    if (mode === 'edit') {
      return true; // Don't check ID in edit mode
    }

    setIdCheckLoading(true);
    try {
      const exists = await checkCustomerExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This customer ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check customer ID:', error);
      setErrors(prev => ({ ...prev, id: 'Failed to check ID availability. Please try again.' }));
      setIsIdValid(false);
      return false;
    } finally {
      setIdCheckLoading(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
  
    // Required fields
    if (!formData.id.trim()) {
      newErrors.id = 'Customer ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Customer ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      // Check ID availability for create mode
      if (!hasIdBeenChecked) {
        const isValid = await checkIdAvailability(formData.id.trim());
        if (!isValid) {
          newErrors.id = 'This customer ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This customer ID is already in use';
      }
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

    // Station validation - REQUIRED FIELD
    if (!formData.stationId) {
      newErrors.stationId = 'Associated station is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (mode === 'edit' || isIdValid);
  };


  

  const handleSubmit = async () => {
    const isFormValid = await validateForm();
    const isValid = await checkIdAvailability(formData.id.trim());
    
    if (!isFormValid) {
      return;
    }

    // Additional check to ensure ID is valid before submission
    if (mode === 'create' && (!isValid)) {
      setSubmitError('Please ensure the customer ID is valid before submitting.');
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
          stationId: formData.stationId,
          station: formData.station,
        };

        await createCustomer(customerData);
      } else if (customer) {
        const customerData: UpdateCustomerRequest = {
          id: customer.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          stationId: formData.stationId,
          station: formData.station, // Include station object for edit mode
        };
        console.log('Customer data before update:', formData.station);
        //console.log('Updating customer:', customerData);
        await updateCustomer(customer.id, customerData);
      }

      onClose();
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      setSubmitError(error?.response?.data?.message || `Failed to ${mode} customer. Please try again.`);
    }
  };

  const isLoading = isCreating || isUpdating;
  const canSubmit = mode === 'edit' || (isIdValid && hasIdBeenChecked) || !formData.id.trim();




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
              Located Station
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.stationId}>
              {/* <InputLabel>Associated Station</InputLabel> */}
              {/* <Select
                value={formData.stationId}
                required
                onChange={handleStationChange}
                //label="Associated Station"
                displayEmpty
              >
                <MenuItem value="">
                 <em>No Station Selected</em> 
                </MenuItem>
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
              </Select> */}

              <BasicSearchableStationSelect
                value={formData.stationId}
                onChange={handleStationChange}
                error={errors.stationId}
                onErrorClear={handleErrorClear}
              />

              {errors.stationId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.stationId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {formData.stationId && (
            <Grid item xs={12}>
              <Alert severity="info">
                This customer will be associated with {formData.stationId} station(s).
              </Alert>
            </Grid>
          )}
            {submitError && (
               <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
          </Grid>
        )}
        {/* Show ID validation status for create mode */}
        {mode === 'create' && formData.id.trim() && hasIdBeenChecked && (
          <Alert 
            severity={isIdValid ? "success" : "error"} 
            sx={{ mb: 2 }}
          >
            {isIdValid 
              ? "Customer ID is available!" 
              : "Customer ID is already in use. Please choose a different ID."
            }
          </Alert>
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