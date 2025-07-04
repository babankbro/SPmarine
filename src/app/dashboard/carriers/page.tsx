// src/app/dashboard/carriers/page.tsx
"use client";

import Link from "next/link";
import { useState, useMemo, JSX, ChangeEvent } from "react";
import { 
  Button, 
  Stack, 
  Typography, 
  Box,
  Chip,
  Alert,
  Skeleton
} from "@mui/material";
import { 
  Download as DownloadIcon,
  Plus as PlusIcon,
  Upload as UploadIcon
} from "@phosphor-icons/react/dist/ssr";

import { CarrierTable } from "@/components/dashboard/carrier/carrier-table";
import { CarrierFilters, CarrierFilters as FilterType } from "@/components/dashboard/carrier/carrier-filters";
import { CarrierForm } from "@/components/dashboard/carrier/carrier-form";
import { Carrier } from "@/types/carrier";
import { useCarrier } from "@/hooks/use-carrier";
import { paths } from "@/paths";

const initialFilterState: FilterType = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export default function Page(): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterType>(initialFilterState);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: carriers, isLoading, isError, error } = useCarrier();
  
  // Filter and sort carriers
  const filteredCarriers = useMemo(() => {
	console.log('Filtering and sorting carriers', carriers);
    if (!carriers) return [];

    let filtered = [...carriers];


    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(carrier => 
        carrier.name.toLowerCase().includes(searchLower) ||
        carrier.id.toLowerCase().includes(searchLower) ||
        (carrier.holder && carrier.holder.toLowerCase().includes(searchLower))
      );
    }

    // Sort carriers
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Carrier];
      let bValue: any = b[filters.sortBy as keyof Carrier];

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [carriers, filters]);

  // Paginated carriers
  const paginatedCarriers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredCarriers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCarriers, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!carriers) return { total: 0, withSpecs: 0, withCompany: 0, withCranes: 0 };

    const counts = {
      total: carriers.length,
      withSpecs: 0,
      withCompany: 0,
      withCranes: 0,
    };

    carriers.forEach(carrier => {
      if (carrier.maxCapacity || carrier.numberOfBulks) {
        counts.withSpecs++;
      }
      
      if (carrier.holder) {
        counts.withCompany++;
      }

      if (carrier.maxCrane) {
        counts.withCranes++;
      }
    });

    return counts;
  }, [carriers]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filtering
  };

  const handleCarrierDeleted = (deletedCarrierId: string) => {
    // Handle pagination if current page becomes empty
    const newTotalItems = filteredCarriers.length - 1;
    const maxPage = Math.max(0, Math.ceil(newTotalItems / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const handleImport = () => {
    console.log('Import carriers from CSV');
    // TODO: Implement CSV import functionality
  };

  const handleExport = () => {
    console.log('Export carriers to CSV');
    // TODO: Implement CSV export functionality
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load carriers. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!carriers && isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!carriers) return <></>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Carrier Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} carriers`}
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`With Specs: ${statusCounts.withSpecs}`}
              color="info" 
              size="small" 
            />
            <Chip 
              label={`With Company: ${statusCounts.withCompany}`}
              color="secondary" 
              size="small" 
            />
            <Chip 
              label={`With Cranes: ${statusCounts.withCranes}`}
              color="success" 
              size="small" 
            />
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<UploadIcon size={20} />}
            variant="outlined"
            onClick={handleImport}
            disabled={isLoading}
          >
            Import
          </Button>
          <Button
            startIcon={<DownloadIcon size={20} />}
            variant="outlined"
            disabled={isLoading || filteredCarriers.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href={`${paths.dashboard.carriers}/new`}
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            disabled={isLoading}
          >
            Create Carrier
          </Button>
        </Stack>
      </Stack>

      {/* Filters Section */}
      <CarrierFilters
        filters={filters}
        onChange={handleFilterChange}
        totalCount={carriers.length}
        filteredCount={filteredCarriers.length}
      />

      {/* Table Section */}
      {isLoading ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} />
            ))}
          </Stack>
        </Box>
      ) : (
        <CarrierTable
          count={filteredCarriers.length}
          page={page}
          rows={paginatedCarriers}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onCarrierDeleted={handleCarrierDeleted}
        />
      )}

      {/* Create Dialog */}
      <CarrierForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
}