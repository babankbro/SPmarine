// src/components/dashboard/tugboat/tugboat-form.tsx
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Boat as BoatIcon,
  Engine as EngineIcon,
  Gauge as GaugeIcon,
  MapPin as LocationIcon,
  CalendarBlank as CalendarIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useTugboat } from "@/hooks/use-tugboat";
import { useStation } from "@/hooks/use-station";
import { Tugboat, CreateTugboatRequest, UpdateTugboatRequest, TugboatFormData } from "@/types/tugboat";
import { Station } from "@/types/station";
import { el } from "date-fns/locale";
import BasicSearchableStationSelect from  "@/components/core/search/station-search-selected";
import HybridDateTimePicker from "@/components/core/datetime/HybridDateTimePicker";

interface TugboatFormProps {
  open: boolean;
  onClose: () => void;
  tugboat?: Tugboat;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

const initialFormData: TugboatFormData = {
  id: '',
  name: '',
  maxCapacity: '',
  maxBarge: '',
  maxFuelCon: '',
  type: 'SEA',
  minSpeed: '',
  maxSpeed: '',
  engineRpm: '',
  horsePower: '',
  waterStatus: 'SEA',
  readyDatetime: new Date().toISOString(),
  stationId: '',
};

export function TugboatForm({ 
  open, 
  onClose, 
  tugboat, 
  mode, 
  onSuccess, 
  onError, 
  embedded = false 
}: TugboatFormProps) {
  const { createTugboat, updateTugboat, refreshData, isCreating, isUpdating, checkTugboatExists } = useTugboat();
  const {
  data: stations,
  isLoading: isStationsLoading,
  isError: isStationsError,
  error: stationsError
} = useStation();
  const [formData, setFormData] = useState<TugboatFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && tugboat) {
      setFormData({
        id: tugboat.id,
        name: tugboat.name,
        maxCapacity: tugboat.maxCapacity.toString(),
        maxBarge: tugboat.maxBarge.toString(),
        maxFuelCon: tugboat.maxFuelCon.toString(),
        type: tugboat.type,
        minSpeed: tugboat.minSpeed.toString(),
        maxSpeed: tugboat.maxSpeed.toString(),
        engineRpm: tugboat.engineRpm.toString(),
        horsePower: tugboat.horsePower.toString(),
        waterStatus: tugboat.waterStatus,
        readyDatetime: typeof tugboat.readyDatetime === 'string' ? tugboat.readyDatetime : tugboat.readyDatetime.toISOString(),
        stationId: tugboat.stationId || '',
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
  }, [mode, tugboat, open]);

  const handleInputChange = (field: keyof TugboatFormData) => (
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

  const handleSelectChange = (field: keyof TugboatFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-sync water status with type when type changes
    if (field === 'type') {
      setFormData(prev => ({ ...prev, [field]: value, waterStatus: value }));
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
      const exists = await checkTugboatExists(id);
      setHasIdBeenChecked(true);
      
      if (exists) {
        setErrors(prev => ({ ...prev, id: 'This tugboat ID is already in use' }));
        setIsIdValid(false);
        return false;
      } else {
        setErrors(prev => ({ ...prev, id: '' }));
        setIsIdValid(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check tugboat ID:', error);
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
    // Required fields validation
    if (!formData.id.trim()) {
      newErrors.id = 'Tugboat ID is required';
      setIsIdValid(false);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      newErrors.id = 'Tugboat ID can only contain letters, numbers, underscores, and hyphens';
      setIsIdValid(false);
    } else if (mode === 'create') {
      if (!hasIdBeenChecked) {
        
        if (!isValid) {
          newErrors.id = 'This tugboat ID is already in use';
        }
      } else if (!isIdValid) {
        newErrors.id = 'This tugboat ID is already in use';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tugboat name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tugboat name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tugboat name must be less than 100 characters';
    } else if (!formData.stationId){
      newErrors.stationId = 'Station is required';
    }

    // Validate numbers
    const numberFields = [
      { field: 'maxCapacity', label: 'Max Capacity', min: 1, max: 1000000 },
      { field: 'maxBarge', label: 'Max Barge', min: 1, max: 50 },
      { field: 'maxFuelCon', label: 'Max Fuel Consumption', min: 0.1, max: 10000 },
      { field: 'minSpeed', label: 'Min Speed', min: 0.1, max: 100 },
      { field: 'maxSpeed', label: 'Max Speed', min: 0.1, max: 100 },
      { field: 'engineRpm', label: 'Engine RPM', min: 100, max: 10000 },
      { field: 'horsePower', label: 'Horse Power', min: 1, max: 100000 },
    ];

    numberFields.forEach(({ field, label, min, max }) => {
      const value = formData[field as keyof TugboatFormData];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = `${label} is required`;
      } else if (isNaN(Number(value))) {
        newErrors[field] = `${label} must be a valid number`;
      } else {
        const numValue = Number(value);
        if (numValue < min) {
          newErrors[field] = `${label} must be at least ${min}`;
        } else if (numValue > max) {
          newErrors[field] = `${label} must not exceed ${max}`;
        }
      }
    });

    // Speed validation
    if (formData.minSpeed && formData.maxSpeed && Number(formData.minSpeed) >= Number(formData.maxSpeed)) {
      newErrors.maxSpeed = 'Max speed must be greater than min speed';
    }

    // Date validation
    if (formData.readyDatetime) {
      const readyDate = new Date(formData.readyDatetime);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      if (readyDate > oneYearFromNow) {
        newErrors.readyDatetime = 'Ready date cannot be more than one year in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (mode === 'edit' || isIdValid);
  };

  const handleSubmit = async () => {
    const isFormValid = await validateForm();
    const isValid = await checkIdAvailability(formData.id.trim());
    
    if (!isFormValid) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }

    if (mode === 'create' && (!isValid)) {
      setSubmitError('Please ensure the tugboat ID is valid before submitting.');
      if (onError) onError('Please ensure the tugboat ID is valid before submitting.');
      return;
    }

    setSubmitError('');

    try {
      if (mode === 'create') {
        const tugboatData: CreateTugboatRequest = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          maxCapacity: Number(formData.maxCapacity),
          maxBarge: Number(formData.maxBarge),
          maxFuelCon: Number(formData.maxFuelCon),
          type: formData.type,
          minSpeed: Number(formData.minSpeed),
          maxSpeed: Number(formData.maxSpeed),
          engineRpm: Number(formData.engineRpm),
          horsePower: Number(formData.horsePower),
          waterStatus: formData.waterStatus,
          readyDatetime: formData.readyDatetime,
          stationId: formData.stationId || undefined,
        };

        await createTugboat(tugboatData);
      } else if (tugboat) {
        const tugboatData: UpdateTugboatRequest = {
          name: formData.name.trim(),
          maxCapacity: Number(formData.maxCapacity),
          maxBarge: Number(formData.maxBarge),
          maxFuelCon: Number(formData.maxFuelCon),
          type: formData.type,
          minSpeed: Number(formData.minSpeed),
          maxSpeed: Number(formData.maxSpeed),
          engineRpm: Number(formData.engineRpm),
          horsePower: Number(formData.horsePower),
          waterStatus: formData.waterStatus,
          readyDatetime: formData.readyDatetime,
          stationId: formData.stationId || undefined,
        };

        await updateTugboat(tugboat.id, tugboatData);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save tugboat:', error);
      const errorMessage = error?.response?.data?.message || `Failed to ${mode} tugboat. Please try again.`;
      setSubmitError(errorMessage);
      if (onError) onError(errorMessage);
    }
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
            ? "✅ Tugboat ID is available!" 
            : "❌ Tugboat ID is already in use. Please choose a different ID."
          }
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information Section */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BoatIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tugboat ID"
            value={formData.id}
            onChange={handleInputChange('id')}
            error={!!errors.id}
            helperText={errors.id || (mode === 'create' ? 'Unique identifier for the tugboat (letters, numbers, _, -)' : 'Tugboat ID cannot be changed')}
            required
            disabled={mode === 'edit' || idCheckLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BoatIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tugboat Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!errors.name}
            helperText={errors.name || 'Descriptive name for the tugboat'}
            required
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        {/* Engine & Performance Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <EngineIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Engine & Performance Specifications
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Capacity"
            value={formData.maxCapacity}
            onChange={handleInputChange('maxCapacity')}
            error={!!errors.maxCapacity}
            helperText={errors.maxCapacity || 'Maximum load capacity in tons'}
            required
            inputProps={{ min: 1, max: 1000000, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">tons</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Barges"
            value={formData.maxBarge}
            onChange={handleInputChange('maxBarge')}
            error={!!errors.maxBarge}
            helperText={errors.maxBarge || 'Maximum number of barges that can be towed'}
            required
            inputProps={{ min: 1, max: 50, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">barges</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Fuel Consumption"
            value={formData.maxFuelCon}
            onChange={handleInputChange('maxFuelCon')}
            error={!!errors.maxFuelCon}
            helperText={errors.maxFuelCon || 'Maximum fuel consumption rate'}
            required
            inputProps={{ min: 0.1, max: 10000, step: 0.1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">L/h</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Horse Power"
            value={formData.horsePower}
            onChange={handleInputChange('horsePower')}
            error={!!errors.horsePower}
            helperText={errors.horsePower || 'Engine power output'}
            required
            inputProps={{ min: 1, max: 100000, step: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EngineIcon size={20} />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">HP</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Min Speed"
            value={formData.minSpeed}
            onChange={handleInputChange('minSpeed')}
            error={!!errors.minSpeed}
            helperText={errors.minSpeed || 'Minimum operational speed'}
            required
            inputProps={{ min: 0.1, max: 100, step: 0.1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GaugeIcon size={20} />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">knots</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Max Speed"
            value={formData.maxSpeed}
            onChange={handleInputChange('maxSpeed')}
            error={!!errors.maxSpeed}
            helperText={errors.maxSpeed || 'Maximum operational speed'}
            required
            inputProps={{ min: 0.1, max: 100, step: 0.1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">knots</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Engine RPM"
            value={formData.engineRpm}
            onChange={handleInputChange('engineRpm')}
            error={!!errors.engineRpm}
            helperText={errors.engineRpm || 'Engine revolutions per minute'}
            required
            inputProps={{ min: 100, max: 10000, step: 10 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">RPM</InputAdornment>,
            }}
          />
        </Grid>

        {/* Operational Information Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Operational Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Tugboat Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange('type')}
              label="Tugboat Type"
            >
              <MenuItem value="SEA">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BoatIcon size={20} />
                  <span>Sea Tugboat</span>
                </Stack>
              </MenuItem>
              <MenuItem value="RIVER">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BoatIcon size={20} />
                  <span>River Tugboat</span>
                </Stack>
              </MenuItem>
            </Select>
            <FormHelperText>
              {errors.type || 'Primary operational environment'}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.waterStatus}>
            <InputLabel>Current Water Status</InputLabel>
            <Select
              value={formData.waterStatus}
              onChange={handleSelectChange('waterStatus')}
              label="Current Water Status"
            >
              <MenuItem value="SEA">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip label="SEA" color="primary" size="small" />
                  <span>Currently in Sea Waters</span>
                </Stack>
              </MenuItem>
              <MenuItem value="RIVER">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip label="RIVER" color="secondary" size="small" />
                  <span>Currently in River Waters</span>
                </Stack>
              </MenuItem>
            </Select>
            <FormHelperText>
              {errors.waterStatus || 'Current location type'}
            </FormHelperText>
          </FormControl>
        </Grid> */}

        <Grid item xs={12}>
          <HybridDateTimePicker
              label="Ready Date & Time"
              value={new Date(formData.readyDatetime)}
              onChange={handleDateChange}
              error={!!errors.readyDatetime}
              helperText={errors.readyDatetime}
              fullWidth
              required
              format24h={true}
            />
        </Grid>

        {/* Station Assignment Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationIcon size={24} />
            <Typography variant="h6" gutterBottom>
              Located Station
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.stationId}>
            
              <BasicSearchableStationSelect
                value={formData.stationId}
                onChange={handleStationChange}
                error={errors.stationId}
                onErrorClear={handleErrorClear}
              />
          </FormControl>
        </Grid>

        {formData.stationId && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<LocationIcon size={20} />}>
              This tugboat will be assigned to <strong>{stations.find(s => s.id === formData.stationId)?.name || formData.stationId}</strong> station.
              {stations.find(s => s.id === formData.stationId) && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Station Type: <Chip 
                    label={stations.find(s => s.id === formData.stationId)?.type} 
                    size="small" 
                    color={stations.find(s => s.id === formData.stationId)?.type === 'SEA' ? 'primary' : 'secondary'}
                  />
                </Typography>
              )}
            </Alert>
          </Grid>
        )}

        {/* Form Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Summary:</strong> {mode === 'create' ? 'Creating' : 'Updating'} tugboat with {formData.horsePower || '0'} HP, 
              speed range {formData.minSpeed || '0'}-{formData.maxSpeed || '0'} knots, 
              capacity for {formData.maxCapacity || '0'} tons and {formData.maxBarge || '0'} barges.
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
              ? (mode === 'create' ? 'Creating Tugboat...' : 'Updating Tugboat...') 
              : (mode === 'create' ? 'Create Tugboat' : 'Update Tugboat')
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
              : (mode === 'create' ? 'Create Tugboat' : 'Update Tugboat')
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
            <BoatIcon size={28} />
            <Typography variant="h5">
              {mode === 'create' ? 'Create New Tugboat' : 'Edit Tugboat'}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {mode === 'create' 
              ? 'Add a new tugboat to your fleet with complete specifications' 
              : 'Update tugboat information and operational details'
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