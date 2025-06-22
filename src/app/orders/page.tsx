"use client";

import { useState, useMemo } from "react";
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
  SvgIcon,
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
  Download as ExportIcon
} from "@phosphor-icons/react/dist/ssr";

import { useOrderContext } from "@/contexts/order-context";
import { OrderTable } from "@/components/order/order-table";
import { OrderForm } from "@/components/order/order-form";
import { Order } from "@/types/order";

interface FilterState {
  search: string;
  type: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function OrdersPage() {
  const { data: orders, isLoading, isError, error, refetch } = useOrderContext();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    status: '',
    sortBy: 'startDateTime',
    sortOrder: 'desc',
  });

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.productName.toLowerCase().includes(searchLower) ||
        order.fromPoint.toLowerCase().includes(searchLower) ||
        order.destPoint.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(order => order.type === filters.type);
    }

    // Status filter
    if (filters.status) {
      const now = new Date();
      filtered = filtered.filter(order => {
        const startDate = new Date(order.startDateTime);
        const dueDate = new Date(order.dueDateTime);
        
        switch (filters.status) {
          case 'scheduled':
            return startDate > now;
          case 'in-progress':
            return startDate <= now && dueDate >= now;
          case 'overdue':
            return dueDate < now;
          default:
            return true;
        }
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Order];
      let bValue: any = b[filters.sortBy as keyof Order];

      // Handle date sorting
      if (filters.sortBy.includes('DateTime')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
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
  }, [orders, filters]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!orders) return { total: 0, scheduled: 0, inProgress: 0, overdue: 0 };

    const now = new Date();
    const counts = {
      total: orders.length,
      scheduled: 0,
      inProgress: 0,
      overdue: 0,
    };

    orders.forEach(order => {
      const startDate = new Date(order.startDateTime);
      const dueDate = new Date(order.dueDateTime);
      
      if (startDate > now) {
        counts.scheduled++;
      } else if (startDate <= now && dueDate >= now) {
        counts.inProgress++;
      } else {
        counts.overdue++;
      }
    });

    return counts;
  }, [orders]);

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

  const handleOrderDeleted = (deletedOrderId: string) => {
    // Handle pagination if current page becomes empty
    const newTotalItems = filteredOrders.length - 1;
    const maxPage = Math.max(0, Math.ceil(newTotalItems / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      sortBy: 'startDateTime',
      sortOrder: 'desc',
    });
    setPage(0);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load orders: {error?.message || 'Unknown error'}
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
            Orders Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} orders`}
			  color="primary" 
              size="small" 
            />
           
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<ExportIcon size={20} />}
            variant="outlined"
            disabled={isLoading || filteredOrders.length === 0}
          >
            Export
          </Button>
          <Button
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            disabled={isLoading}
          >
            Create Order
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterIcon size={20} />
            <Typography variant="h6">Filters</Typography>
            {(filters.search || filters.type || filters.status) && (
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </Stack>
          
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Search orders...</InputLabel>
              <OutlinedInput
                value={filters.search}
                onChange={handleFilterChange('search')}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon size={20} />
                  </InputAdornment>
                }
                label="Search orders..."
                placeholder="Product, location, or order ID"
              />
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={handleFilterChange('type')}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="IMPORT">Import</MenuItem>
                <MenuItem value="EXPORT">Export</MenuItem>
              </Select>
            </FormControl>

            

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={handleFilterChange('sortBy')}
              >
                <MenuItem value="startDateTime">Start Date</MenuItem>
                <MenuItem value="dueDateTime">Due Date</MenuItem>
                <MenuItem value="productName">Product Name</MenuItem>
                <MenuItem value="demand">Demand</MenuItem>
                <MenuItem value="type">Type</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={filters.sortOrder}
                label="Order"
                onChange={handleFilterChange('sortOrder')}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Showing {filteredOrders.length} of {orders?.length || 0} orders
          </Typography>
        </Stack>
      </Card>

      {/* Orders Table */}
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
        <OrderTable
          count={filteredOrders.length}
          page={page}
          rows={paginatedOrders}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onOrderDeleted={handleOrderDeleted}
        />
      )}

      {/* Create Order Dialog */}
      <OrderForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
      />
    </Box>
  );
}