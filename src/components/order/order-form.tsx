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
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import HybridDateTimePicker from "@/components/core/datetime/HybridDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Package as PackageIcon,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Truck as TruckIcon,
  User as UserIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useOrderContext } from "@/contexts/order-context";
import { useCarrier } from "@/hooks/use-carrier";
import { useCustomer } from "@/hooks/use-customer";
import { useStation } from "@/hooks/use-station";
import { Order, CreateOrderRequest, UpdateOrderRequest, OrderFormData } from "@/types/order";
import { Station } from "@/types/station";
import { Carrier } from "@/types/carrier";
import { Customer } from "@/types/customer";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  order?: Order;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  embedded?: boolean;
}

// TypeScript interfaces for components
interface OrderTypeSelectProps {
  formData: OrderFormData;
  errors: Record<string, string>;
  onTypeChange: (event: SelectChangeEvent<'IMPORT' | 'EXPORT'>, child: React.ReactNode) => void;
}

interface RouteInformationSectionProps {
  formData: OrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrderFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  stations: Station[];
  carriers: Carrier[];
  customers: Customer[];
  isLoadingCarriers: boolean;
  isCustomersLoading: boolean;
}

const initialFormData: OrderFormData = {
  id: '',
  type: 'EXPORT',
  fromEntityId: '',
  destEntityId: '',
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
  cr8: '0',
  cr9: '0',
  timeReadyCR1: '0',
  timeReadyCR2: '0',
  timeReadyCR3: '0',
  timeReadyCR4: '0',
  timeReadyCR5: '0',
  timeReadyCR6: '0',
  timeReadyCR7: '0',
  timeReadyCR8: '0',
  timeReadyCR9: '0',
};

// OrderTypeSelect Component
const OrderTypeSelect: React.FC<OrderTypeSelectProps> = ({ 
  formData, 
  errors, 
  onTypeChange 
}) => {
  return (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth error={!!errors.type}>
        <InputLabel>Order Type</InputLabel>
        <Select
          value={formData.type}
          onChange={onTypeChange}
          label="Order Type"
        >
          <MenuItem value="IMPORT">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PackageIcon size={20} />
              <Box>
                <Typography variant="body2">Import</Typography>
                <Typography variant="caption" color="text.secondary">
                  Carrier → Customer
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
          <MenuItem value="EXPORT">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PackageIcon size={20} />
              <Box>
                <Typography variant="body2">Export</Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer → Carrier
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
        </Select>
        <FormHelperText>
          {errors.type || 'Type of shipment operation'}
        </FormHelperText>
      </FormControl>
    </Grid>
  );
};

const RouteInformationSection: React.FC<RouteInformationSectionProps> = ({ 
  formData, 
  setFormData, 
  errors, 
  setErrors, 
  stations,
  carriers,
  customers,
  isLoadingCarriers,
  isCustomersLoading
}) => {
  // Helper function to clear errors
  const clearFieldError = (field: string): void => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get filtered stations based on carrier selection for IMPORT orders
  const getFilteredStations = (field: 'start' | 'dest'): Station[] => {
    // For IMPORT orders, filter start stations based on carrier's water type
    if (formData.type === 'IMPORT' && field === 'start' && formData.fromEntityId) {
      const selectedCarrier = carriers.find(c => c.id === formData.fromEntityId);
      
      if (selectedCarrier) {
        // If carrier has a specific water type, filter stations accordingly
        // Assuming carriers have a 'waterType' or similar property
        // For now, we'll check if carrier name/type indicates water type
        
        // Option 1: If carrier has a waterType property
        // return stations.filter(station => station.type === selectedCarrier.waterType);
        
        // Option 2: If we need to determine from carrier properties
        // For carriers coming from sea, show only SEA stations for start
        // This is a common pattern where sea carriers can only dock at sea ports
        return stations.filter(station => station.type === 'SEA');
      }
    }
    
    // For EXPORT orders or when no carrier is selected, show all stations
    return stations;
  };

  // Auto-select station when customer is selected (for destination in IMPORT orders)
  useEffect(() => {
    if (formData.type === 'IMPORT' && formData.destEntityId) {
      const selectedCustomer = customers.find(c => c.id === formData.destEntityId);
      if (selectedCustomer?.stationId && selectedCustomer.stationId !== formData.destStationId) {
        setFormData(prev => ({ 
          ...prev, 
          destStationId: selectedCustomer?.stationId || ''
        }));
        clearFieldError('destStationId');
      }
    }
  }, [formData.type, formData.destEntityId, customers]);

  // Auto-select station when customer is selected (for origin in EXPORT orders)
  useEffect(() => {
    if (formData.type === 'EXPORT' && formData.fromEntityId) {
      const selectedCustomer = customers.find(c => c.id === formData.fromEntityId);
      if (selectedCustomer?.stationId && selectedCustomer.stationId !== formData.startStationId) {
        setFormData(prev => ({ 
          ...prev, 
          startStationId: selectedCustomer?.stationId || ''
        }));
        clearFieldError('startStationId');
      }
    }
  }, [formData.type, formData.fromEntityId, customers]);

  // Clear start station when carrier changes (for IMPORT orders)
  useEffect(() => {
    if (formData.type === 'IMPORT' && formData.fromEntityId) {
      const availableStations = getFilteredStations('start');
      const currentStartStation = availableStations.find(s => s.id === formData.startStationId);
      
      // If current start station is not in the filtered list, clear it
      if (formData.startStationId && !currentStartStation) {
        setFormData(prev => ({ 
          ...prev, 
          startStationId: '' 
        }));
      }
    }
  }, [formData.type, formData.fromEntityId, carriers]);


  // Handle entity selection with automatic station selection
  // Handle entity selection with enhanced logic
  const handleFromEntityChange = (
    event: React.SyntheticEvent<Element, Event>, 
    newValue: Carrier | Customer | null
  ): void => {
    const entityId = newValue?.id || '';
    
    // Clear start station when carrier changes for IMPORT orders
    if (formData.type === 'IMPORT') {
      setFormData(prev => ({ 
        ...prev, 
        fromEntityId: entityId,
        startStationId: '' // Clear start station to force reselection with new filter
      }));
      clearFieldError('startStationId');
    } else {
      setFormData(prev => ({ ...prev, fromEntityId: entityId }));
    }
    
    clearFieldError('fromEntityId');

    // Auto-select station if customer is selected and it's an EXPORT order
    if (formData.type === 'EXPORT' && newValue && 'email' in newValue && newValue.stationId) {
      setFormData(prev => ({ 
        ...prev, 
        fromEntityId: entityId,
        startStationId: newValue.stationId || ''
      }));
      clearFieldError('startStationId');
    }
  };

  const handleDestEntityChange = (
    event: React.SyntheticEvent<Element, Event>, 
    newValue: Carrier | Customer | null
  ): void => {
    const entityId = newValue?.id || '';
    setFormData(prev => ({ ...prev, destEntityId: entityId }));
    clearFieldError('destEntityId');

    // Auto-select station if customer is selected and it's an IMPORT order
    if (formData.type === 'IMPORT' && newValue && 'email' in newValue && newValue.stationId) {
      setFormData(prev => ({ 
        ...prev, 
        destEntityId: entityId,
        destStationId: newValue.stationId || ''
      }));
      clearFieldError('destStationId');
    }
  };

 

  // Handle manual station selection
  const handleStationChange = (field: 'startStationId' | 'destStationId') => (
    event: SelectChangeEvent<string>
  ): void => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  // Get current selections with proper typing
  const selectedFromEntity: Carrier | Customer | undefined = formData.type === 'IMPORT' 
    ? carriers.find((c: Carrier) => c.id === formData.fromEntityId)
    : customers.find((c: Customer) => c.id === formData.fromEntityId);

  const selectedDestEntity: Carrier | Customer | undefined = formData.type === 'IMPORT'
    ? customers.find((c: Customer) => c.id === formData.destEntityId)
    : carriers.find((c: Carrier) => c.id === formData.destEntityId);

  // Get station info for display
  const getStationDisplayInfo = (stationId: string, isAutoSelected: boolean = false) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return null;

    return {
      station,
      isAutoSelected,
      displayText: isAutoSelected ? `${station.name} (Auto-selected from customer)` : station.name
    };
  };

  // Get filtered stations for each field
  const availableStartStations = getFilteredStations('start');
  const availableDestStations = getFilteredStations('dest');

  // Check if stations are auto-selected
  const isStartStationAutoSelected = formData.type === 'EXPORT' && 
    selectedFromEntity && 'email' in selectedFromEntity && 
    selectedFromEntity.stationId === formData.startStationId;

  const isDestStationAutoSelected = formData.type === 'IMPORT' && 
    selectedDestEntity && 'email' in selectedDestEntity && 
    selectedDestEntity.stationId === formData.destStationId;

    // Check if start station is filtered due to carrier selection
  const isStartStationFiltered = formData.type === 'IMPORT' && 
    formData.fromEntityId && 
    availableStartStations.length < stations.length;

  // Get labels based on order type
  const getEntityLabels = (): {
    fromLabel: string;
    fromHelperText: string;
    destLabel: string;
    destHelperText: string;
  } => {
    if (formData.type === 'IMPORT') {
      return {
        fromLabel: 'From Carrier',
        fromHelperText: 'Select the carrier/ship providing the goods',
        destLabel: 'To Customer',
        destHelperText: 'Select the customer receiving the goods'
      };
    } else {
      return {
        fromLabel: 'From Customer',
        fromHelperText: 'Select the customer sending the goods',
        destLabel: 'To Carrier',
        destHelperText: 'Select the carrier/ship taking the goods'
      };
    }
  };

  const labels = getEntityLabels();

  return (
    <>
      {/* Section Header */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocationIcon size={24} />
          <Typography variant="h6" gutterBottom>
            Route Information
          </Typography>
          <Chip
            label={formData.type}
            color={formData.type === 'IMPORT' ? 'primary' : 'secondary'}
            size="small"
          />
          {isStartStationFiltered && (
            <Chip
              label="Sea Stations Only"
              color="info"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {formData.type === 'IMPORT' 
            ? 'Import: Carrier → Customer (goods coming into port)'
            : 'Export: Customer → Carrier (goods leaving port)'
          }
          {isStartStationFiltered && (
            <Typography component="span" variant="body2" color="info.main" sx={{ ml: 1 }}>
              • Start stations filtered for sea carrier
            </Typography>
          )}
        </Typography>
      </Grid>

      {/* From Entity Autocomplete - Keep existing implementation but add carrier water type info */}
      <Grid item xs={12} sm={6}>
        <Autocomplete
          fullWidth
          options={formData.type === 'IMPORT' ? carriers : customers}
          getOptionLabel={(option: Carrier | Customer) => `${option.name} (${option.id})`}
          value={selectedFromEntity || null}
          onChange={handleFromEntityChange}
          loading={formData.type === 'IMPORT' ? isLoadingCarriers : isCustomersLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labels.fromLabel}
              error={!!errors.fromEntityId}
              helperText={
                errors.fromEntityId || 
                labels.fromHelperText +
                (formData.type === 'IMPORT' ? ' (Sea carriers will filter available start stations)' : '')
              }
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    {formData.type === 'IMPORT' ? (
                      <TruckIcon size={20} style={{ marginRight: 8 }} />
                    ) : (
                      <UserIcon size={20} style={{ marginRight: 8 }} />
                    )}
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {(formData.type === 'IMPORT' ? isLoadingCarriers : isCustomersLoading) ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option: Carrier | Customer) => {
            const isCarrier = (opt: Carrier | Customer): opt is Carrier => {
              return 'maxCapacity' in opt;
            };

            const isCustomer = !isCarrier(option);
            const customerStation = isCustomer && option.stationId 
              ? stations.find(s => s.id === option.stationId)
              : null;

            return (
              <Box component="li" {...props}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  {formData.type === 'IMPORT' ? (
                    <TruckIcon size={16} />
                  ) : (
                    <UserIcon size={16} />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {option.id}
                      {formData.type === 'IMPORT' && isCarrier(option) && option.holder && ` • ${option.holder}`}
                      {formData.type === 'EXPORT' && isCustomer && option.email && ` • ${option.email}`}
                      {isCustomer && customerStation && ` • Station: ${customerStation.name}`}
                    </Typography>
                  </Box>
                  {formData.type === 'IMPORT' && isCarrier(option) && (
                    <Stack direction="row" spacing={1}>
                      {option.maxCapacity && (
                        <Chip
                          label={`${option.maxCapacity.toLocaleString()}t`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label="Sea"
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                  {isCustomer && customerStation && (
                    <Chip
                      label={customerStation.type}
                      color={customerStation.type === 'SEA' ? 'primary' : 'secondary'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            );
          }}
          noOptionsText={
            formData.type === 'IMPORT' ? 'No carriers found' : 'No customers found'
          }
        />
      </Grid>

      {/* To Entity Autocomplete - Keep existing implementation */}
      <Grid item xs={12} sm={6}>
        <Autocomplete
          fullWidth
          options={formData.type === 'IMPORT' ? customers : carriers}
          getOptionLabel={(option: Carrier | Customer) => `${option.name} (${option.id})`}
          value={selectedDestEntity || null}
          onChange={handleDestEntityChange}
          loading={formData.type === 'IMPORT' ? isCustomersLoading : isLoadingCarriers}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labels.destLabel}
              error={!!errors.destEntityId}
              helperText={errors.destEntityId || labels.destHelperText}
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    {formData.type === 'IMPORT' ? (
                      <UserIcon size={20} style={{ marginRight: 8 }} />
                    ) : (
                      <TruckIcon size={20} style={{ marginRight: 8 }} />
                    )}
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {(formData.type === 'IMPORT' ? isCustomersLoading : isLoadingCarriers) ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option: Carrier | Customer) => {
            const isCarrier = (opt: Carrier | Customer): opt is Carrier => {
              return 'maxCapacity' in opt;
            };

            const isCustomer = !isCarrier(option);
            const customerStation = isCustomer && option.stationId 
              ? stations.find(s => s.id === option.stationId)
              : null;

            return (
              <Box component="li" {...props}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  {formData.type === 'IMPORT' ? (
                    <UserIcon size={16} />
                  ) : (
                    <TruckIcon size={16} />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {option.id}
                      {formData.type === 'IMPORT' && isCustomer && option.email && ` • ${option.email}`}
                      {formData.type === 'EXPORT' && isCarrier(option) && option.holder && ` • ${option.holder}`}
                      {isCustomer && customerStation && ` • Station: ${customerStation.name}`}
                    </Typography>
                  </Box>
                  {formData.type === 'EXPORT' && isCarrier(option) && option.maxCapacity && (
                    <Chip
                      label={`${option.maxCapacity.toLocaleString()}t`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {isCustomer && customerStation && (
                    <Chip
                      label={customerStation.type}
                      color={customerStation.type === 'SEA' ? 'primary' : 'secondary'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            );
          }}
          noOptionsText={
            formData.type === 'IMPORT' ? 'No customers found' : 'No carriers found'
          }
        />
      </Grid>

      {/* Enhanced Start Station Selection with Filtering */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.startStationId}>
          <InputLabel>Start Station</InputLabel>
          <Select
            value={formData.startStationId}
            onChange={handleStationChange('startStationId')}
            label="Start Station"
            required
          >
            {availableStartStations.map((station: Station) => (
              <MenuItem 
                key={station.id} 
                value={station.id}
                sx={{
                  backgroundColor: station.id === formData.startStationId && isStartStationAutoSelected 
                    ? 'action.selected' 
                    : 'inherit'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationIcon size={16} />
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {station.name}
                        </Typography>
                        {station.id === formData.startStationId && isStartStationAutoSelected && (
                          <Chip
                            label="Auto"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                        )}
                        {isStartStationFiltered && (
                          <Chip
                            label="Filtered"
                            color="info"
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {station.id} • {station.distanceKm}km from origin
                      </Typography>
                    </Box>
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {errors.startStationId || 
             (isStartStationAutoSelected 
               ? 'Station auto-selected from customer' 
               : isStartStationFiltered
               ? `Showing ${availableStartStations.length} sea stations for carrier`
               : 'Station where the journey begins'
             )
            }
          </Typography>
        </FormControl>
      </Grid>

      {/* Destination Station Selection - Keep existing implementation */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.destStationId}>
          <InputLabel>Destination Station</InputLabel>
          <Select
            value={formData.destStationId}
            onChange={handleStationChange('destStationId')}
            label="Destination Station"
            required
          >
            {availableDestStations.map((station: Station) => (
              <MenuItem 
                key={station.id} 
                value={station.id}
                sx={{
                  backgroundColor: station.id === formData.destStationId && isDestStationAutoSelected 
                    ? 'action.selected' 
                    : 'inherit'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationIcon size={16} />
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {station.name}
                        </Typography>
                        {station.id === formData.destStationId && isDestStationAutoSelected && (
                          <Chip
                            label="Auto"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.625rem' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {station.id} • {station.distanceKm}km from origin
                      </Typography>
                    </Box>
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {errors.destStationId || 
             (isDestStationAutoSelected 
               ? 'Station auto-selected from customer' 
               : 'Final destination station'
             )
            }
          </Typography>
        </FormControl>
      </Grid>

      {/* Enhanced Route Summary with Filtering Info */}
      <Grid item xs={12}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.level1', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Route Summary
          </Typography>
          <Stack spacing={1}>
            {/* Entity Route */}
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1}>
                {formData.type === 'IMPORT' ? <TruckIcon size={16} /> : <UserIcon size={16} />}
                <Typography variant="body2" color="text.secondary">
                  From: {selectedFromEntity?.name || 'Not selected'}
                  {formData.type === 'IMPORT' && selectedFromEntity && (
                    <Chip
                      label="Sea Carrier"
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                    />
                  )}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">→</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {formData.type === 'IMPORT' ? <UserIcon size={16} /> : <TruckIcon size={16} />}
                <Typography variant="body2" color="text.secondary">
                  To: {selectedDestEntity?.name || 'Not selected'}
                </Typography>
              </Stack>
            </Stack>
            
            {/* Station Route */}
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon size={16} />
                <Typography variant="body2" color="text.secondary">
                  Via: {availableStartStations.find((s: Station) => s.id === formData.startStationId)?.name || 'Start'}
                  {isStartStationAutoSelected && (
                    <Chip
                      label="Auto"
                      color="success"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                    />
                  )}
                  {isStartStationFiltered && (
                    <Chip
                      label="Sea Only"
                      color="info"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                    />
                  )}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">→</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon size={16} />
                <Typography variant="body2" color="text.secondary">
                  {availableDestStations.find((s: Station) => s.id === formData.destStationId)?.name || 'End'}
                  {isDestStationAutoSelected && (
                    <Chip
                      label="Auto"
                      color="success"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                    />
                  )}
                </Typography>
              </Stack>
            </Stack>

            {/* Filtering Information */}
            {isStartStationFiltered && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="caption">
                  Showing {availableStartStations.length} sea stations available for the selected carrier. 
                  Sea carriers can only dock at sea ports.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Box>
      </Grid>
    </>
  );
};

// Main OrderForm Component
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
  const { data: carriers = [], isLoading: isLoadingCarriers } = useCarrier();
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomer();
  const { data: stations = [], isLoading: isStationsLoading } = useStation();
  
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [hasIdBeenChecked, setHasIdBeenChecked] = useState<boolean>(false);


  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        id: order.id,
        type: order.type,
        fromEntityId: order.fromEntityId,
        destEntityId: order.destEntityId,
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
        cr8: order.cr8.toString(),
        cr9: order.cr9.toString(),
        timeReadyCR1: order.timeReadyCR1.toString(),
        timeReadyCR2: order.timeReadyCR2.toString(),
        timeReadyCR3: order.timeReadyCR3.toString(),
        timeReadyCR4: order.timeReadyCR4.toString(),
        timeReadyCR5: order.timeReadyCR5.toString(),
        timeReadyCR6: order.timeReadyCR6.toString(),
        timeReadyCR7: order.timeReadyCR7.toString(),
        timeReadyCR8: order.timeReadyCR8.toString(),
        timeReadyCR9: order.timeReadyCR9.toString(),
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

  // Enhanced order type change handler
  const handleOrderTypeChange = (event: SelectChangeEvent<'IMPORT' | 'EXPORT'>, child: React.ReactNode): void => {
    const newType = event.target.value as 'IMPORT' | 'EXPORT';
    setFormData(prev => ({ 
      ...prev, 
      type: newType,
      // Clear entity selections when type changes
      fromEntityId: '',
      destEntityId: ''
    }));
    
    // Clear related errors
    if (errors.type || errors.fromEntityId || errors.destEntityId) {
      setErrors(prev => ({ 
        ...prev, 
        type: '', 
        fromEntityId: '', 
        destEntityId: '' 
      }));
    }
  };

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

    if (!formData.fromEntityId) {
      newErrors.fromEntityId = 'Origin point is required';
    }

    if (!formData.destEntityId) {
      newErrors.destEntityId = 'Destination point is required';
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
          fromEntityId: formData.fromEntityId?.trim() || '',
          destEntityId: formData.destEntityId?.trim() || '',
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
          cr8: Number(formData.cr8),
          cr9: Number(formData.cr9),
          timeReadyCR1: Number(formData.timeReadyCR1),
          timeReadyCR2: Number(formData.timeReadyCR2),
          timeReadyCR3: Number(formData.timeReadyCR3),
          timeReadyCR4: Number(formData.timeReadyCR4),
          timeReadyCR5: Number(formData.timeReadyCR5),
          timeReadyCR6: Number(formData.timeReadyCR6),
          timeReadyCR7: Number(formData.timeReadyCR7),
          timeReadyCR8: Number(formData.timeReadyCR8),
          timeReadyCR9: Number(formData.timeReadyCR9),
        };

        await createOrder(orderData);
      } else if (order) {
        const orderData: UpdateOrderRequest = {
          type: formData.type,
          fromEntityId: formData.fromEntityId?.trim() || '',
          destEntityId: formData.destEntityId?.trim() || '',
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
          cr8: Number(formData.cr8),
          cr9: Number(formData.cr9),
          timeReadyCR1: Number(formData.timeReadyCR1),
          timeReadyCR2: Number(formData.timeReadyCR2),
          timeReadyCR3: Number(formData.timeReadyCR3),
          timeReadyCR4: Number(formData.timeReadyCR4),
          timeReadyCR5: Number(formData.timeReadyCR5),
          timeReadyCR6: Number(formData.timeReadyCR6),
          timeReadyCR7: Number(formData.timeReadyCR7),
          timeReadyCR8: Number(formData.timeReadyCR8),
          timeReadyCR9: Number(formData.timeReadyCR9),
        };
        console.log("Updating order with data:", orderData)
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

        {/* Order Type Select Component */}
        <OrderTypeSelect 
          formData={formData}
          errors={errors}
          onTypeChange={handleOrderTypeChange}
        />

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

        {/* Route Information Section Component */}
        <RouteInformationSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          stations={stations}
          carriers={carriers}
          customers={customers}
          isLoadingCarriers={isLoadingCarriers}
          isCustomersLoading={isCustomersLoading}
        />

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
          <HybridDateTimePicker
              label="Start Date & Time"
              value={new Date(formData.startDateTime)}
              onChange={handleDateChange('startDateTime')}
              error={!!errors.startDateTime}
              helperText={errors.startDateTime}
              fullWidth
              required
              format24h={true}
            />
        </Grid>

        <Grid item xs={12} sm={6}>
          <HybridDateTimePicker
              label="Due Date & Time"
              value={new Date(formData.dueDateTime)}
              onChange={handleDateChange('dueDateTime')}
              error={!!errors.dueDateTime}
              helperText={errors.dueDateTime}
              fullWidth
              required
              format24h={true}
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
              Crane Requirements
            </Typography>
          </Stack>
        </Grid>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Grid container spacing={2} key={num} item xs={12}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={`CR${num} Value`}
                value={formData[`cr${num}` as keyof OrderFormData]}
                onChange={handleInputChange(`cr${num}` as keyof OrderFormData)}
                error={!!errors[`cr${num}`]}
                helperText={errors[`cr${num}`] || `Crane Rate requirement ${num} value`}
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