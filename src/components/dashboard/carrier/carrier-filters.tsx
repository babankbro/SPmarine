// src/components/dashboard/carrier/carrier-filters.tsx
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

export interface CarrierFilters {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CarrierFiltersProps {
  filters: CarrierFilters;
  onChange: (filters: CarrierFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const initialFilters: CarrierFilters = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function CarrierFilters({ 
  filters, 
  onChange, 
  totalCount = 0, 
  filteredCount = 0 
}: CarrierFiltersProps) {
  const [localFilters, setLocalFilters] = useState<CarrierFilters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof CarrierFilters, value: any) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...initialFilters };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  const handleClearSingleFilter = (field: keyof CarrierFilters) => {
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search carriers..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Name, ID, or company"
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

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select 
                  value={localFilters.sortBy} 
                  label="Sort By" 
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="name">Carrier Name</MenuItem>
                  <MenuItem value="holder">Company</MenuItem>
                  <MenuItem value="maxCapacity">Max Capacity</MenuItem>
                  <MenuItem value="numberOfBulks">Bulk Count</MenuItem>
                  <MenuItem value="maxCrane">Max Cranes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} sm={6} md={3}>
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
                ? `${activeFilterChips.length} filter(s) applied • Showing ${filteredCount} of ${totalCount} carriers`
                : `No filters applied • Showing all ${totalCount} carriers`
              }
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}