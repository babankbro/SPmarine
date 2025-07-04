// src/components/dashboard/carrier/carrier-form.tsx
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
  Box,
  Typography,
  Divider,
  Alert,
  Stack,
  InputAdornment,
} from "@mui/material";
import {
  Anchor  as ShipIcon,
  Factory as FactoryIcon,
  Gauge as GaugeIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useCarrier } from "@/hooks/use-carrier";
import { Carrier, CreateCarrierRequest, UpdateCarrierRequest, CarrierFormData } from "@/types/carrier";

interface CarrierFormProps {
  open: boolean;
  onClose: () => void;
  carrier?: Carrier;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

const initialFormData: CarrierFormData = {
  id: '',
  name: '',
  maxCapacity: '',
  holder: '',
  numberOfBulks: '',
  maxCrane: '',
};

export function CarrierForm({ 
  open, 
  onClose, 
  carrier, 
  mode, 
  onSuccess, 
  onError,
  embedded = false 
}: CarrierFormProps) {
  const { createCarrier, updateCarrier, checkCarrierExists, isCreating, isUpdating } = useCarrier();
  const [formData, setFormData] = useState<CarrierFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && carrier) {
      setFormData({
        id: carrier.id,
        name: carrier.name,
        maxCapacity: carrier.maxCapacity?.toString() || '',
        holder: carrier.holder || '',
        numberOfBulks: carrier.numberOfBulks?.toString() || '',
        maxCrane: carrier.maxCrane?.toString() || '',
      });
      setIsIdValid(true);
      setHasIdBeenChecked(true);
    } else {
      setFormData(initialFormData);
      setIsIdValid(true);
      setHasIdBeenChecked(false);
    }
    setErrors({});
    setSubmitError('');
  }, [mode, carrier, open]);

  const handleInputChange = (field: keyof CarrierFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    console.log(`Field changed: ${field}, Value: ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset ID validation states when ID changes
    if (field === 'id' && mode === 'create') {
      setIsIdValid(true);
      setHasIdBeenChecked(false);
      
      // Debounced ID check
      if (value.trim() && /^[a-zA-Z0-9_-]+$/.test(value.trim())) {
        const timeoutId = setTimeout(() => {
          checkIdAvailability(value.trim());
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const checkIdAvailability = async (id: string): Promise<boolean> => {
    if (mode === 'edit') {
      return true;
    }

    setIdCheckLoading(true);
    try {
      const exists = await checkCarrierExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This carrier ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check carrier ID:', error);
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
      newErrors.id = 'Carrier ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Carrier ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      if (!hasIdBeenChecked) {
        const isValid = await checkIdAvailability(formData.id.trim());
        if (!isValid) {
          newErrors.id = 'This carrier ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This carrier ID is already in use';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Carrier name is required';
    }

    // Validate numbers if provided
    const numberFields = [
      { field: 'maxCapacity', label: 'Max Capacity', min: 1 },
      { field: 'numberOfBulks', label: 'Number of Bulks', min: 1 },
      { field: 'maxCrane', label: 'Max Cranes', min: 1 },
    ];

    numberFields.forEach(({ field, label, min }) => {
      const value = formData[field as keyof CarrierFormData];
      if (value && value.toString().trim() !== '') {
        if (isNaN(Number(value))) {
          newErrors[field] = `${label} must be a valid number`;
        } else {
          const numValue = Number(value);
          if (numValue < min) {
            newErrors[field] = `${label} must be at least ${min}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (mode === 'edit' || isIdValid);
  };

  const handleSubmit = async () => {
    const isFormValid = await validateForm();
    
    if (!isFormValid) {
      return;
    }

    if (mode === 'create' && (!isIdValid || !hasIdBeenChecked)) {
      setSubmitError('Please ensure the carrier ID is valid before submitting.');
      return;
    }

    setSubmitError('');

    try {
      if (mode === 'create') {
        const carrierData: CreateCarrierRequest = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
          holder: formData.holder.trim() || undefined,
          numberOfBulks: formData.numberOfBulks ? Number(formData.numberOfBulks) : undefined,
          maxCrane: formData.maxCrane ? Number(formData.maxCrane) : undefined,
        };

        await createCarrier(carrierData);
      } else if (carrier) {
        const carrierData: UpdateCarrierRequest = {
          name: formData.name.trim(),
          maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
          holder: formData.holder.trim() || undefined,
          numberOfBulks: formData.numberOfBulks ? Number(formData.numberOfBulks) : undefined,
          maxCrane: formData.maxCrane ? Number(formData.maxCrane) : undefined,
        };

        await updateCarrier(carrier.id, carrierData);
      }

      if (onSuccess) onSuccess();
      if (!embedded) onClose();
    } catch (error: any) {
      console.error('Failed to save carrier:', error);
      const errorMessage = error?.response?.data?.message || `Failed to ${mode} carrier. Please try again.`;
      setSubmitError(errorMessage);
      if (onError) onError(errorMessage);
    }
  };

  const isLoading = isCreating || isUpdating;

  const formContent = (
    <>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {mode === 'create' && formData.id.trim() && hasIdBeenChecked && (
        <Alert 
          severity={isIdValid ? "success" : "error"} 
          sx={{ mb: 2 }}
        >
          {isIdValid 
            ? "Carrier ID is available!" 
            : "Carrier ID is already in use. Please choose a different ID."
          }
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShipIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Carrier ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            error={!!errors.id}
            helperText={errors.id || (mode === 'create' ? 'Unique identifier for the carrier' : 'Carrier ID cannot be changed')}
            required
            disabled={mode === 'edit' || idCheckLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShipIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Carrier Name"
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
            label="Company/Holder"
            value={formData.holder}
            onChange={handleInputChange('holder')}
            error={!!errors.holder}
            helperText={errors.holder || 'Company that owns or operates this carrier'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FactoryIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Specifications */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <GaugeIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Specifications
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Capacity"
            value={formData.maxCapacity}
            onChange={handleInputChange('maxCapacity')}
            error={!!errors.maxCapacity}
            helperText={errors.maxCapacity || 'Maximum carrying capacity (tons)'}
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">tons</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Number of Bulks"
            value={formData.numberOfBulks}
            onChange={handleInputChange('numberOfBulks')}
            error={!!errors.numberOfBulks}
            helperText={errors.numberOfBulks || 'Number of cargo compartments'}
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">compartments</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Cranes"
            value={formData.maxCrane}
            onChange={handleInputChange('maxCrane')}
            error={!!errors.maxCrane}
            helperText={errors.maxCrane || 'Maximum number of cranes'}
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">cranes</InputAdornment>,
            }}
          />
        </Grid>

        {/* Form Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Summary:</strong> {mode === 'create' ? 'Creating' : 'Updating'} carrier "{formData.name}" 
              {formData.holder && ` operated by ${formData.holder}`}
              {formData.maxCapacity && ` with capacity of ${formData.maxCapacity} tons`}.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </>
  );

  if (embedded) {
    return (
      <Box>
        {formContent}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
              : (mode === 'create' ? 'Create Carrier' : 'Update Carrier')
            }
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ShipIcon size={28} />
          <Typography variant="h5">
            {mode === 'create' ? 'Create New Carrier' : 'Edit Carrier'}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {mode === 'create' 
            ? 'Add a new carrier to your fleet with complete specifications' 
            : 'Update carrier information and specifications'
          }
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {formContent}
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
            : (mode === 'create' ? 'Create Carrier' : 'Update Carrier')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}