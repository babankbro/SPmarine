// src/components/dashboard/barge/barge-filters.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Typography,
  Button,
  Grid,
  InputAdornment,
  Chip,
  Box,
  Autocomplete,
} from "@mui/material";
import { 
  MagnifyingGlass as SearchIcon,
  X as ClearIcon,
  FunnelSimple as FilterIcon,
  CalendarBlank as CalendarIcon,
  MapPin as LocationIcon,
  Boat as BoatIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { useStation } from "@/hooks/use-station";
import { Station } from "@/types/station";

export interface BargeFilters {
  search: string;
  waterStatus: string;
  stationId: string;
  stationType: string;
  readyStatus: string;
  readyDateFrom: Date | null;
  readyDateTo: Date | null;
  minCapacity: string;
  maxCapacity: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface BargeFiltersProps {
  filters: BargeFilters;
  onChange: (filters: BargeFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const initialFilters: BargeFilters = {
  search: '',
  waterStatus: '',
  stationId: '',
  stationType: '',
  readyStatus: '',
  readyDateFrom: null,
  readyDateTo: null,
  minCapacity: '',
  maxCapacity: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function BargeFilters({ 
  filters, 
  onChange, 
  totalCount = 0, 
  filteredCount = 0 
}: BargeFiltersProps) {
  const stations = useStation();
  const [localFilters, setLocalFilters] = useState<BargeFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof BargeFilters, value: any) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...initialFilters };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  const handleClearSingleFilter = (field: keyof BargeFilters) => {
    let defaultValue: any = '';
    if (field === 'readyDateFrom' || field === 'readyDateTo') {
      defaultValue = null;
    } else if (field === 'sortBy') {
      defaultValue = 'name';
    } else if (field === 'sortOrder') {
      defaultValue = 'asc';
    }
    
    handleFilterChange(field, defaultValue);
  };

  const hasActiveFilters = Object.entries(localFilters).some(([key, value]) => {
    if (key === 'sortBy' && value === 'name') return false;
    if (key === 'sortOrder' && value === 'asc') return false;
    if (value === null || value === '') return false;
    return true;
  });

  const getActiveFilterChips = () => {
    const chips = [];
    
    if (localFilters.search) {
      chips.push({
        key: 'search',
        label: `Search: "${localFilters.search}"`,
        onDelete: () => handleClearSingleFilter('search'),
      });
    }
    
    if (localFilters.waterStatus) {
      chips.push({
        key: 'waterStatus',
        label: `Water: ${localFilters.waterStatus}`,
        onDelete: () => handleClearSingleFilter('waterStatus'),
      });
    }
    
    if (localFilters.stationId) {
      const station = stations.find(s => s.id === localFilters.stationId);
      chips.push({
        key: 'stationId',
        label: `Station: ${station?.name || localFilters.stationId}`,
        onDelete: () => handleClearSingleFilter('stationId'),
      });
    }
    
    if (localFilters.stationType) {
      chips.push({
        key: 'stationType',
        label: `Station Type: ${localFilters.stationType}`,
        onDelete: () => handleClearSingleFilter('stationType'),
      });
    }
    
    if (localFilters.readyStatus) {
      chips.push({
        key: 'readyStatus',
        label: `Status: ${localFilters.readyStatus}`,
        onDelete: () => handleClearSingleFilter('readyStatus'),
      });
    }
    
    if (localFilters.minCapacity) {
      chips.push({
        key: 'minCapacity',
        label: `Min Capacity: ${localFilters.minCapacity}`,
        onDelete: () => handleClearSingleFilter('minCapacity'),
      });
    }
    
    if (localFilters.maxCapacity) {
      chips.push({
        key: 'maxCapacity',
        label: `Max Capacity: ${localFilters.maxCapacity}`,
        onDelete: () => handleClearSingleFilter('maxCapacity'),
      });
    }

    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Header with Filter Icon and Summary */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <FilterIcon size={20} />
                <Typography variant="h6">Filters</Typography>
                {hasActiveFilters && (
                  <Button 
                    size="small" 
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon size={16} />}
                    color="error"
                    variant="outlined"
                  >
                    Clear All
                  </Button>
                )}
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredCount} of {totalCount} barges
                </Typography>
                <Button
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="outlined"
                >
                  {isExpanded ? 'Less Filters' : 'More Filters'}
                </Button>
              </Stack>
            </Stack>

            {/* Active Filter Chips */}
            {activeFilterChips.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {activeFilterChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      label={chip.label}
                      onDelete={chip.onDelete}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Primary Filters Row */}
            <Grid container spacing={2}>
              {/* Search */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Search barges..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name, ID, or station"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon size={20} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>

              {/* Water Status */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Water Status</InputLabel>
                  <Select
                    value={localFilters.waterStatus}
                    label="Water Status"
                    onChange={(e) => handleFilterChange('waterStatus', e.target.value)}
                  >
                    <MenuItem value="">All Waters</MenuItem>
                    <MenuItem value="SEA">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BoatIcon size={16} />
                        <span>Sea</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="RIVER">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BoatIcon size={16} />
                        <span>River</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Ready Status */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ready Status</InputLabel>
                  <Select
                    value={localFilters.readyStatus}
                    label="Ready Status"
                    onChange={(e) => handleFilterChange('readyStatus', e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="not-ready">Not Ready</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={localFilters.sortBy}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="capacity">Capacity</MenuItem>
                    <MenuItem value="weight">Weight</MenuItem>
                    <MenuItem value="readyDatetime">Ready Date</MenuItem>
                    <MenuItem value="waterStatus">Water Status</MenuItem>
                    <MenuItem value="stationId">Station</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort Order */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={localFilters.sortOrder}
                    label="Order"
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Expanded Filters */}
            {isExpanded && (
              <Stack spacing={3}>
                <Typography variant="subtitle1" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                  Advanced Filters
                </Typography>

                <Grid container spacing={2}>
                  {/* Station Selection */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Autocomplete
                      options={stations}
                      getOptionLabel={(station) => `${station.name} (${station.id})`}
                      value={stations.find(s => s.id === localFilters.stationId) || null}
                      onChange={(_, station) => handleFilterChange('stationId', station?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Specific Station"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationIcon size={16} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, station) => (
                        <Box component="li" {...props}>
                          <Stack direction="row" alignItems="center" spacing={1} width="100%">
                            <LocationIcon size={16} />
                            <Stack sx={{ flexGrow: 1 }}>
                              <Typography variant="body2">{station.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {station.id} • Type: {station.type}
                              </Typography>
                            </Stack>
                            <Chip 
                              label={station.type} 
                              color={station.type === 'SEA' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </Stack>
                        </Box>
                      )}
                      size="small"
                    />
                  </Grid>

                  {/* Station Type */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Station Type</InputLabel>
                      <Select
                        value={localFilters.stationType}
                        label="Station Type"
                        onChange={(e) => handleFilterChange('stationType', e.target.value)}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="SEA">Sea Stations</MenuItem>
                        <MenuItem value="RIVER">River Stations</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Capacity Range */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Min Capacity"
                        type="number"
                        value={localFilters.minCapacity}
                        onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                        size="small"
                        inputProps={{ min: 0 }}
                        sx={{ width: '50%' }}
                      />
                      <Typography variant="body2" color="text.secondary">to</Typography>
                      <TextField
                        label="Max Capacity"
                        type="number"
                        value={localFilters.maxCapacity}
                        onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
                        size="small"
                        inputProps={{ min: 0 }}
                        sx={{ width: '50%' }}
                      />
                    </Stack>
                  </Grid>

                  {/* Date Range */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DatePicker
                        label="Ready From"
                        value={localFilters.readyDateFrom}
                        onChange={(date) => handleFilterChange('readyDateFrom', date)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { width: '50%' },
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon size={16} />
                                </InputAdornment>
                              ),
                            },
                          }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">to</Typography>
                      <DatePicker
                        label="Ready To"
                        value={localFilters.readyDateTo}
                        onChange={(date) => handleFilterChange('readyDateTo', date)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { width: '50%' },
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon size={16} />
                                </InputAdornment>
                              ),
                            },
                          }
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* Filter Summary */}
            <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                {hasActiveFilters 
                  ? `${activeFilterChips.length} filter(s) applied • ${filteredCount} barges match your criteria`
                  : `No filters applied • Showing all ${totalCount} barges`
                }
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}