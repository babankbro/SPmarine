// src/components/dashboard/station/station-form.tsx
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
} from "@mui/material";
import dayjs from "dayjs";
import { useStation } from "@/hooks/use-station";
import { Station, CreateStationRequest, UpdateStationRequest } from "@/types/station";

interface StationFormProps {
  open: boolean;
  onClose: () => void;
  station?: Station;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

interface StationFormData {
  id: string;
  name: string;
  type: 'SEA' | 'RIVER';
  latitude: string;
  longitude: string;
  distanceKm: string;

}

const initialFormData: StationFormData = {
  id: '',
  name: '',
  type: 'SEA',
  latitude: '',
  longitude: '',
  distanceKm: '',
 
};

export function StationForm({ 
  open, 
  onClose, 
  station, 
  mode, 
  onSuccess, 
  onError,
  embedded = false 
}: StationFormProps) {
  const { createStation, updateStation, checkStationExists, isCreating, isUpdating } = useStation();
  const [formData, setFormData] = useState<StationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && station) {
      setFormData({
        id: station.id,
        name: station.name,
        type: station.type,
        latitude: station.latitude?.toString() || '',
        longitude: station.longitude?.toString() || '',
        distanceKm: station.distanceKm?.toString() || '',
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
  }, [mode, station, open]);

  const handleInputChange = (field: keyof StationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
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

  const handleSelectChange = (field: keyof StationFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const checkIdAvailability = async (id: string): Promise<boolean> => {
    if (mode === 'edit') {
      return true;
    }

    setIdCheckLoading(true);
    try {
      const exists = await checkStationExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This station ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check station ID:', error);
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
      newErrors.id = 'Station ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Station ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      if (!hasIdBeenChecked) {
        const isValid = await checkIdAvailability(formData.id.trim());
        if (!isValid) {
          newErrors.id = 'This station ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This station ID is already in use';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }

    // Coordinate validation
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (!formData.latitude.trim() || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Valid latitude (-90 to 90) is required';
    }
    
    if (!formData.longitude.trim() || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Valid longitude (-180 to 180) is required';
    }

    // Distance validation
    const distance = parseFloat(formData.distanceKm);
    if (!formData.distanceKm.trim() || isNaN(distance) || distance < 0) {
      newErrors.distanceKm = 'Valid distance (0 or greater) is required';
    }

 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (mode === 'edit' || isIdValid);
  };

  const handleSubmit = async () => {
    const isFormValid = await validateForm();
    
    if (!isFormValid) {
      return;
    }

    if (mode === 'create' && (!isIdValid || !hasIdBeenChecked)) {
      setSubmitError('Please ensure the station ID is valid before submitting.');
      return;
    }

    setSubmitError('');

    try {
      if (mode === 'create') {
        const stationData: CreateStationRequest = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          type: formData.type,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          distanceKm: parseFloat(formData.distanceKm),
         
        };

        await createStation(stationData);
      } else if (station) {
        const stationData: UpdateStationRequest = {
          name: formData.name.trim(),
          type: formData.type,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          distanceKm: parseFloat(formData.distanceKm),
       
        };

        await updateStation(station.id, stationData);
      }

      if (onSuccess) onSuccess();
      if (!embedded) onClose();
    } catch (error: any) {
      console.error('Failed to save station:', error);
      const errorMessage = error?.response?.data?.message || `Failed to ${mode} station. Please try again.`;
      setSubmitError(errorMessage);
      if (onError) onError(errorMessage);
    }
  };

  const isLoading = isCreating || isUpdating;
  const canSubmit = mode === 'edit' || (isIdValid && hasIdBeenChecked) || !formData.id.trim();

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
            ? "Station ID is available!" 
            : "Station ID is already in use. Please choose a different ID."
          }
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
          <TextField
            fullWidth
            label="Station ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            error={!!errors.id}
            helperText={errors.id || (mode === 'create' ? 'Unique identifier for the station' : 'Station ID cannot be changed')}
            required
            disabled={mode === 'edit' || idCheckLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Station Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Station Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange('type')}
              label="Station Type"
            >
              <MenuItem value="SEA">Sea Station</MenuItem>
              <MenuItem value="RIVER">River Station</MenuItem>
            </Select>
          </FormControl>
        </Grid>

     

        {/* Location Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Location Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={formData.latitude}
            onChange={handleInputChange('latitude')}
            error={!!errors.latitude}
            helperText={errors.latitude}
            required
            inputProps={{ step: "any", min: -90, max: 90 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={formData.longitude}
            onChange={handleInputChange('longitude')}
            error={!!errors.longitude}
            helperText={errors.longitude}
            required
            inputProps={{ step: "any", min: -180, max: 180 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Distance (km)"
            type="number"
            value={formData.distanceKm}
            onChange={handleInputChange('distanceKm')}
            error={!!errors.distanceKm}
            helperText={errors.distanceKm}
            required
            inputProps={{ step: "any", min: 0 }}
          />
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
        </Grid>

        {/* Dates */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Important Dates
          </Typography>
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
              : (mode === 'create' ? 'Create Station' : 'Update Station')
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
        {mode === 'create' ? 'Create New Station' : 'Edit Station'}
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
            : (mode === 'create' ? 'Create Station' : 'Update Station')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}