// src/app/dashboard/customers/page.tsx
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

import { useCustomer } from "@/hooks/use-customer";
import { CustomersTable } from "@/components/dashboard/customer/customers-table";
import { CustomerForm } from "@/components/dashboard/customer/customer-form";
import { Customer } from "@/types/customer";
import { paths } from "@/paths";

interface FilterState {
  search: string;
  stationType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function CustomersPage() {
  const { data: customers, isLoading, isError, error, refetch } = useCustomer();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    stationType: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    let filtered = [...customers];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.address.toLowerCase().includes(searchLower) ||
        customer.id.toLowerCase().includes(searchLower) ||
        customer.station?.name.toLowerCase().includes(searchLower) ||
        customer.station?.id.toLowerCase().includes(searchLower)
      );
    }

    // Station type filter
    if (filters.stationType) {
      filtered = filtered.filter(customer => 
        customer.station?.name.toLowerCase().includes(filters.stationType.toLowerCase()) ||
        customer.station?.id.toLowerCase() === filters.stationType.toLowerCase()
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Customer];
      let bValue: any = b[filters.sortBy as keyof Customer];

      // Handle special sorting cases
      if (filters.sortBy === 'stationName') {
        aValue = a.station?.name?.toLowerCase() || '';
        bValue = b.station?.name?.toLowerCase() || '';
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      // Handle special sorting cases
      else if (filters.sortBy === 'stationId') {
        aValue = a.station?.id?.toLowerCase() || '';
        bValue = b.station?.id?.toLowerCase() || '';
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }


      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [customers, filters]);

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCustomers, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!customers) return { total: 0, withStations: 0, withoutStations: 0, seaStations: 0, riverStations: 0 };

    const counts = {
      total: customers.length,
      withStations: 0,
      withoutStations: 0,
      seaStations: 0,
      riverStations: 0,
    };

    customers.forEach(customer => {
      if (customer.station ) {
        counts.withStations++;
        if (customer.station.type === 'SEA') {
          counts.seaStations++;
        }
        if (customer.station.type === 'RIVER') {
          counts.riverStations++;
        }
      } else {
        counts.withoutStations++;
      }
    });

    return counts;
  }, [customers]);

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

  const handleCustomerDeleted = (deletedCustomerId: string) => {
    // Handle pagination if current page becomes empty
    const newTotalItems = filteredCustomers.length - 1;
    const maxPage = Math.max(0, Math.ceil(newTotalItems / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      stationType: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setPage(0);
  };

  const handleImport = () => {
    // TODO: Implement CSV import functionality
    console.log('Import customers from CSV');
  };

  const handleExport = () => {
    // TODO: Implement CSV export functionality
    console.log('Export customers to CSV');
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load customers: {error?.message || 'Unknown error'}
          <Button onClick={() => refetch()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Customer Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} customers`}
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`With Stations: ${statusCounts.withStations}`}
              color="success" 
              size="small" 
            />
            <Chip 
              label={`Without Stations: ${statusCounts.withoutStations}`}
              color="warning" 
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
            disabled={isLoading || filteredCustomers.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href={`${paths.dashboard.customers}/new`}
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            disabled={isLoading}
          >
            Create Customer
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterIcon size={20} />
            <Typography variant="h6">Filters</Typography>
            {(filters.search || filters.stationType) && (
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </Stack>
          
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Search customers...</InputLabel>
              <OutlinedInput
                value={filters.search}
                onChange={handleFilterChange('search')}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon size={20} />
                  </InputAdornment>
                }
                label="Search customers..."
                placeholder="Name, email, address, or station"
              />
            </FormControl>

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

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={handleFilterChange('sortBy')}
              >
                <MenuItem value="name">Customer Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="address">Address</MenuItem>
                <MenuItem value="stationName">Station Name</MenuItem>
                <MenuItem value="stationId">Station ID</MenuItem>
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
            Showing {filteredCustomers.length} of {customers?.length || 0} customers
          </Typography>
        </Stack>
      </Card>

      {/* Customers Table */}
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
        <CustomersTable
          count={filteredCustomers.length}
          page={page}
          rows={paginatedCustomers}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onCustomerDeleted={handleCustomerDeleted}
        />
      )}

      {/* Create Customer Dialog */}
      <CustomerForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
      />
    </Box>
  );
}