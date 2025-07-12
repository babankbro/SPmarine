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
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { useBarge } from "@/hooks/use-barge";
import { useStation } from "@/hooks/use-station";
import { Barge, CreateBargeRequest, UpdateBargeRequest, BargeFormData } from "@/types/barge";
import { Station } from "@/types/station";

interface BargeFormProps {
  open: boolean;
  onClose: () => void;
  barge?: Barge;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

const initialFormData: BargeFormData = {
  id: '',
  name: '',
  weight: '',
  capacity: '',
  waterStatus: 'SEA',
  stationId: '',
  setupTime: '',
  readyDatetime: new Date().toISOString(),
  distanceKm: '',
};

export function BargeForm({ 
  open, 
  onClose, 
  barge, 
  mode, 
  onSuccess, 
  onError, 
  embedded = false 
}: BargeFormProps) {
  const { createBarge, updateBarge, refreshData, isCreating, isUpdating, checkBargeExists } = useBarge();
  const {
  data: stations,
  isLoading: isStationsLoading,
  isError: isStationsError,
  error: stationsError
} = useStation();
  const [formData, setFormData] = useState<BargeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && barge) {
      setFormData({
        id: barge.id,
        name: barge.name,
        weight: barge.weight.toString(),
        capacity: barge.capacity.toString(),
        waterStatus: barge.waterStatus,
        stationId: barge.stationId || '',
        setupTime: barge.setupTime.toString(),
        readyDatetime: typeof barge.readyDatetime === 'string' ? barge.readyDatetime : barge.readyDatetime.toISOString(),
        distanceKm: barge.distanceKm?.toString() || '',
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
  }, [mode, barge, open]);

  const handleInputChange = (field: keyof BargeFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // // ID validation for create mode
    // if (field === 'id' && mode === 'create') {
    //   setIsIdValid(true);
    //   setHasIdBeenChecked(false);
      
    //   if (value.trim() && /^[a-zA-Z0-9_-]+$/.test(value.trim())) {
    //     const timeoutId = setTimeout(() => {
    //       checkIdAvailability(value.trim());
    //     }, 500);
        
    //     return () => clearTimeout(timeoutId);
    //   }
    // }
  };

  const handleSelectChange = (field: keyof BargeFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, readyDatetime: date.toISOString() }));
      
      if (errors.readyDatetime) {
        setErrors(prev => ({ ...prev, readyDatetime: '' }));
      }
    }
  };

  const checkIdAvailability = async (id: string): Promise<boolean> => {
    if (mode === 'edit') return true;

    setIdCheckLoading(true);
    try {
      const exists = await checkBargeExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This barge ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check barge ID:', error);
      setErrors(prev => ({ ...prev, id: 'Failed to check ID availability. Please try again.' }));
      setIsIdValid(false);
      return false;
    } finally {
      setIdCheckLoading(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    const isValid = await checkIdAvailability(formData.id.trim());
    // Required fields
    if (!formData.id.trim()) {
      newErrors.id = 'Barge ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Barge ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      if (!hasIdBeenChecked) {
        
        if (!isValid) {
          newErrors.id = 'This barge ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This barge ID is already in use';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Barge name is required';
    }

    if (!formData.stationId.trim()) {
      newErrors.stationId = 'Station is required';
    }

    // Validate numbers
    const numberFields = ['weight', 'capacity', 'setupTime'];
    numberFields.forEach(field => {
      const value = formData[field as keyof BargeFormData];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = 'This field is required';
      } else if (isNaN(Number(value))) {
        newErrors[field] = 'Must be a valid number';
      } else if (Number(value) <= 0) {
        newErrors[field] = 'Must be greater than 0';
      }
    });

    if (formData.distanceKm && isNaN(Number(formData.distanceKm))) {
      newErrors.distanceKm = 'Must be a valid number';
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

    if (mode === 'create' && (!isValid)) {
      setSubmitError('Please ensure the barge ID is valid before submitting.');
      if (onError) onError('Please ensure the barge ID is valid before submitting.');
      return;
    }

    setSubmitError('');

    try {
      if (mode === 'create') {
        const bargeData: CreateBargeRequest = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          weight: Number(formData.weight),
          capacity: Number(formData.capacity),
          waterStatus: formData.waterStatus,
          stationId: formData.stationId || undefined,
          setupTime: Number(formData.setupTime),
          readyDatetime: formData.readyDatetime,
          distanceKm: formData.distanceKm ? Number(formData.distanceKm) : undefined,
        };

        await createBarge(bargeData);
      } else if (barge) {
        const bargeData: UpdateBargeRequest = {
          name: formData.name.trim(),
          weight: Number(formData.weight),
          capacity: Number(formData.capacity),
          waterStatus: formData.waterStatus,
          stationId: formData.stationId || undefined,
          setupTime: Number(formData.setupTime),
          readyDatetime: formData.readyDatetime,
          distanceKm: formData.distanceKm ? Number(formData.distanceKm) : undefined,
        };

        await updateBarge(barge.id, bargeData);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save barge:', error);
      const errorMessage = error?.response?.data?.message || `Failed to ${mode} barge. Please try again.`;
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
            ? "Barge ID is available!" 
            : "Barge ID is already in use. Please choose a different ID."
          }
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Barge Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Barge ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            error={!!errors.id}
            helperText={errors.id || (mode === 'create' ? 'Unique identifier for the barge' : 'Barge ID cannot be changed')}
            required
            disabled={mode === 'edit' || idCheckLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Barge Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        {/* Specifications */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Specifications
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Weight (tons)"
            value={formData.weight}
            onChange={handleInputChange('weight')}
            error={!!errors.weight}
            helperText={errors.weight}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Capacity (tons)"
            value={formData.capacity}
            onChange={handleInputChange('capacity')}
            error={!!errors.capacity}
            helperText={errors.capacity}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Setup Time (minutes)"
            value={formData.setupTime}
            onChange={handleInputChange('setupTime')}
            error={!!errors.setupTime}
            helperText={errors.setupTime}
            required
          />
        </Grid>

        {/* Operational Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Operational Information
          </Typography>
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.waterStatus}>
            <InputLabel>Water Status</InputLabel>
            <Select
              value={formData.waterStatus}
              onChange={handleSelectChange('waterStatus')}
              label="Water Status"
            >
              <MenuItem value="SEA">Sea</MenuItem>
              <MenuItem value="RIVER">River</MenuItem>
            </Select>
            {errors.waterStatus && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.waterStatus}
              </Typography>
            )}
          </FormControl>
        </Grid> */}

        <Grid item xs={12} sm={12}>
          <DateTimePicker
            label="Ready Date & Time"
            value={new Date(formData.readyDatetime)}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.readyDatetime,
                helperText: errors.readyDatetime,
              }
            }}
          />
        </Grid>

        {/* Station Assignment */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Located Station
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.stationId}>
            <InputLabel>Assigned Station</InputLabel>
            <Select
              value={formData.stationId}
              onChange={(event) => {
                const station = stations.find((s) => s.id === formData.stationId);
                setFormData((prevState) => ({
                  ...prevState,
                  stationId: event.target.value,
                  waterStatus: station ? station.type : 'SEA', // Default to SEA if no station selected
                }));
                handleSelectChange('stationId')
              }}
         
              label="Assigned Station"
              displayEmpty
              required
            >
              {/* <MenuItem value="">
                <em>No Station Selected</em>
              </MenuItem> */}
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
              This barge will be assigned to {stations.find(s => s.id === formData.stationId)?.name || formData.stationId} station.
            </Alert>
          </Grid>
        )}

        {/* Optional Distance */}
        {/* <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Distance (km)"
            value={formData.distanceKm}
            onChange={handleInputChange('distanceKm')}
            error={!!errors.distanceKm}
            helperText={errors.distanceKm || "Optional distance information"}
          />
        </Grid> */}
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
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Barge' : 'Update Barge')
            }
          </Button>
        </DialogActions>
      )}

      {embedded && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
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
              : (mode === 'create' ? 'Create Barge' : 'Update Barge')
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
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          {mode === 'create' ? 'Create New Barge' : 'Edit Barge'}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {formContent}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}