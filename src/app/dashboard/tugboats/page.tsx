// src/app/dashboard/tugboats/page.tsx - Enhanced main page
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

import { TugboatTable } from "@/components/dashboard/tugboat/tugboat-table";
import { TugboatFilters, TugboatFilters as FilterType } from "@/components/dashboard/tugboat/tugboat-filters";
import { Tugboat } from "@/types/tugboat";
import { useTugboat } from "@/hooks/use-tugboat";
import { paths } from "@/paths";

const initialFilterState: FilterType = {
  search: '',
  type: '',
  waterStatus: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export default function Page(): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterType>(initialFilterState);

  const { data:tugboat, isLoading, isError, error } = useTugboat();
  
  // Filter and sort tugboats
  const filteredTugboats = useMemo(() => {
    if (!tugboat) return [];

    let filtered = [...tugboat];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tug => 
        tug.name.toLowerCase().includes(searchLower) ||
        tug.id.toLowerCase().includes(searchLower) ||
        tug.type.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(tug => tug.type === filters.type);
    }

    // Water status filter
    if (filters.waterStatus) {
      filtered = filtered.filter(tug => tug.waterStatus === filters.waterStatus);
    }

    // Sort tugboats
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Tugboat];
      let bValue: any = b[filters.sortBy as keyof Tugboat];

      // Handle date sorting
      if (filters.sortBy === 'readyDatetime') {
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
  }, [tugboat, filters]);

  // Paginated tugboats
  const paginatedTugboats = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredTugboats.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTugboats, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!tugboat) return { total: 0, sea: 0, river: 0, ready: 0 };

    const now = new Date();
    const counts = {
      total: tugboat.length,
      sea: 0,
      river: 0,
      ready: 0,
    };

    tugboat.forEach(tug => {
      if (tug.type === 'SEA') {
        counts.sea++;
      } else {
        counts.river++;
      }
      
      if (new Date(tug.readyDatetime) <= now) {
        counts.ready++;
      }
    });

    return counts;
  }, [tugboat]);

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

  const handleImport = () => {
    console.log('Import tugboats from CSV');
    // TODO: Implement CSV import functionality
  };

  const handleExport = () => {
    console.log('Export tugboats to CSV');
    // TODO: Implement CSV export functionality
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load tugboats. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!tugboat && isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!tugboat) return <></>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tugboat Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} tugboats`}
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`Sea: ${statusCounts.sea}`}
              color="info" 
              size="small" 
            />
            <Chip 
              label={`River: ${statusCounts.river}`}
              color="secondary" 
              size="small" 
            />
            <Chip 
              label={`Ready: ${statusCounts.ready}`}
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
            disabled={isLoading || filteredTugboats.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href={`${paths.dashboard.tugboats}/new`}
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            disabled={isLoading}
          >
            Create Tugboat
          </Button>
        </Stack>
      </Stack>

      {/* Filters Section */}
      <TugboatFilters
        filters={filters}
        onChange={handleFilterChange}
        totalCount={tugboat.length}
        filteredCount={filteredTugboats.length}
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
        <TugboatTable
          count={filteredTugboats.length}
          page={page}
          rows={paginatedTugboats}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Box>
  );
}