// src/components/dashboard/tugboat/tugboat-filters.tsx
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
} from "@mui/material";
import { 
  MagnifyingGlass as SearchIcon,
  X as ClearIcon,
  FunnelSimple as FilterIcon,
} from "@phosphor-icons/react/dist/ssr";

export interface TugboatFilters {
  search: string;
  type: string;
  waterStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface TugboatFiltersProps {
  filters: TugboatFilters;
  onChange: (filters: TugboatFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const initialFilters: TugboatFilters = {
  search: '',
  type: '',
  waterStatus: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function TugboatFilters({ 
  filters, 
  onChange, 
  totalCount = 0, 
  filteredCount = 0 
}: TugboatFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TugboatFilters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof TugboatFilters, value: any) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...initialFilters };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  const handleClearSingleFilter = (field: keyof TugboatFilters) => {
    let defaultValue: any = '';
    if (field === 'sortBy') {
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
    
    if (localFilters.type) {
      chips.push({
        key: 'type',
        label: `Type: ${localFilters.type}`,
        onDelete: () => handleClearSingleFilter('type'),
      });
    }
    
    if (localFilters.waterStatus) {
      chips.push({
        key: 'waterStatus',
        label: `Water Status: ${localFilters.waterStatus}`,
        onDelete: () => handleClearSingleFilter('waterStatus'),
      });
    }

    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  return (
    <Card sx={{ mb: 3 }}>
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

          {/* Filter Controls */}
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search tugboats..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Name, ID, or specifications"
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

            {/* Type */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={localFilters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="SEA">Sea</MenuItem>
                  <MenuItem value="RIVER">River</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="SEA">Sea</MenuItem>
                  <MenuItem value="RIVER">River</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select 
                  value={localFilters.sortBy} 
                  label="Sort By" 
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="name">Tugboat Name</MenuItem>
                  <MenuItem value="maxCapacity">Max Capacity</MenuItem>
                  <MenuItem value="maxSpeed">Max Speed</MenuItem>
                  <MenuItem value="readyDatetime">Ready Date</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} sm={6} md={2.5}>
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

          {/* Filter Summary */}
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {hasActiveFilters 
                ? `${activeFilterChips.length} filter(s) applied • Showing ${filteredCount} of ${totalCount} tugboats`
                : `No filters applied • Showing all ${totalCount} tugboats`
              }
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}