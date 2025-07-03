// src/app/dashboard/barges/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Stack,
  Typography,
  InputAdornment,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import { 
  Plus as PlusIcon,
  MagnifyingGlass as SearchIcon,
  FunnelSimple as FilterIcon,
  Download as ExportIcon,
  Upload as ImportIcon
} from "@phosphor-icons/react/dist/ssr";

import { useBarge } from "@/hooks/use-barge";
import { BargeTable } from "@/components/dashboard/barge/barge-table";
import { BargeForm } from "@/components/dashboard/barge/barge-form";
import { Barge } from "@/types/barge";
import { paths } from "@/paths";

interface FilterState {
  search: string;
  waterStatus: string;
  stationType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function BargesPage() {
  const { data: barges, isLoading, isError, error, refetch } = useBarge();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    waterStatus: '',
    stationType: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Filter and sort barges
  const filteredBarges = useMemo(() => {
    if (!barges) return [];

    let filtered = [...barges];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(barge => 
        barge.name.toLowerCase().includes(searchLower) ||
        barge.id.toLowerCase().includes(searchLower) ||
        barge.station?.name.toLowerCase().includes(searchLower)
      );
    }

    // Water status filter
    if (filters.waterStatus) {
      filtered = filtered.filter(barge => 
        barge.waterStatus === filters.waterStatus
      );
    }

    // Station type filter
    if (filters.stationType) {
      filtered = filtered.filter(barge => 
        barge.station?.type === filters.stationType
      );
    }

    // Sort barges
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof Barge] || '';
      const bValue = b[filters.sortBy as keyof Barge] || '';
	  

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [barges, filters]);

  // Paginated barges
  const paginatedBarges = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredBarges.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBarges, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!barges) return { total: 0, seaBarges: 0, riverBarges: 0, readyBarges: 0 };

    const counts = {
      total: barges.length,
      seaBarges: 0,
      riverBarges: 0,
      readyBarges: 0,
    };

    barges.forEach(barge => {
      if (barge.waterStatus === 'SEA') {
        counts.seaBarges++;
      } else {
        counts.riverBarges++;
      }
      
      if (barge.readyDatetime && new Date(barge.readyDatetime) <= new Date()) {
        counts.readyBarges++;
      }
    });

    return counts;
  }, [barges]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof FilterState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleCreateSuccess = () => {
    refetch();
    setCreateDialogOpen(false);
  };

  const handleBargeDeleted = (deletedBargeId: string) => {
    // Handle pagination if current page becomes empty
    const newTotalItems = filteredBarges.length - 1;
    const maxPage = Math.max(0, Math.ceil(newTotalItems / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      waterStatus: '',
      stationType: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setPage(0);
  };

  const handleImport = () => {
    // TODO: Implement CSV import functionality
    console.log('Import barges from CSV');
  };

  const handleExport = () => {
    // TODO: Implement CSV export functionality
    console.log('Export barges to CSV');
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load barges: {error?.message || 'Unknown error'}
          <Button onClick={() => refetch()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Barge Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} barges`}
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`Sea: ${statusCounts.seaBarges}`}
              color="info" 
              size="small" 
            />
            <Chip 
              label={`River: ${statusCounts.riverBarges}`}
              color="secondary" 
              size="small" 
            />
            <Chip 
              label={`Ready: ${statusCounts.readyBarges}`}
              color="success" 
              size="small" 
            />
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<ImportIcon size={20} />}
            variant="outlined"
            onClick={handleImport}
            disabled={isLoading}
          >
            Import
          </Button>
          <Button
            startIcon={<ExportIcon size={20} />}
            variant="outlined"
            disabled={isLoading || filteredBarges.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href={`${paths.dashboard.barges}/new`}
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            disabled={isLoading}
          >
            Create Barge
          </Button>
        </Stack>
      </Stack>

      {/* Filters Section */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterIcon size={20} />
            <Typography variant="h6">Filters</Typography>
            {(filters.search || filters.waterStatus || filters.stationType) && (
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </Stack>
          
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {/* Search Input */}
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Search barges...</InputLabel>
              <OutlinedInput
                value={filters.search}
                onChange={handleFilterChange('search')}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon size={20} />
                  </InputAdornment>
                }
                label="Search barges..."
                placeholder="Name, ID, or station"
              />
            </FormControl>

            {/* Water Status Filter */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Water Status</InputLabel>
              <Select
                value={filters.waterStatus}
                label="Water Status"
                onChange={handleFilterChange('waterStatus')}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="SEA">Sea</MenuItem>
                <MenuItem value="RIVER">River</MenuItem>
              </Select>
            </FormControl>

            {/* Station Type Filter */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Station Type</InputLabel>
              <Select
                value={filters.stationType}
                label="Station Type"
                onChange={handleFilterChange('stationType')}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="SEA">Sea Stations</MenuItem>
                <MenuItem value="RIVER">River Stations</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Controls */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select 
                value={filters.sortBy} 
                label="Sort By" 
                onChange={handleFilterChange('sortBy')}
              >
                <MenuItem value="name">Barge Name</MenuItem>
                <MenuItem value="capacity">Capacity</MenuItem>
                <MenuItem value="weight">Weight</MenuItem>
                <MenuItem value="readyDatetime">Ready Date</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select 
                value={filters.sortOrder} 
                label="Order" 
                onChange={handleFilterChange('sortOrder')}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Showing {filteredBarges.length} of {barges?.length || 0} barges
          </Typography>
        </Stack>
      </Card>

      {/* Table Section */}
      {isLoading ? (
        <Card>
          <Box sx={{ p: 3 }}>
            <Stack spacing={1}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={60} />
              ))}
            </Stack>
          </Box>
        </Card>
      ) : (
        <BargeTable
          count={filteredBarges.length}
          page={page}
          rows={paginatedBarges}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onBargeDeleted={handleBargeDeleted}
        />
      )}

      {/* Create Dialog */}
      <BargeForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
      />
    </Box>
  );
}