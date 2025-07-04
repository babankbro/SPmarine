// src/app/dashboard/stations/page.tsx
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

import { StationTable } from "@/components/dashboard/station/station-table";
import { StationFilters, StationFilters as FilterType } from "@/components/dashboard/station/station-filters";
import { StationForm } from "@/components/dashboard/station/station-form";
import { Station } from "@/types/station";
import { useStation } from "@/hooks/use-station";
import { paths } from "@/paths";

const initialFilterState: FilterType = {
  search: '',
  type: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export default function Page(): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterType>(initialFilterState);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: stations, isLoading, isError, error } = useStation();
  
  // Filter and sort stations
  const filteredStations = useMemo(() => {
    if (!stations) return [];

    let filtered = [...stations];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchLower) ||
        station.id.toLowerCase().includes(searchLower) ||
        station.type.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(station => station.type === filters.type);
    }

    // Sort stations
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Station];
      let bValue: any = b[filters.sortBy as keyof Station];

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
  }, [stations, filters]);

  // Paginated stations
  const paginatedStations = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStations.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStations, page, rowsPerPage]);

  // Get status counts for display
  const statusCounts = useMemo(() => {
    if (!stations) return { total: 0, sea: 0, river: 0, withAssets: 0 };

    const counts = {
      total: stations.length,
      sea: 0,
      river: 0,
      withAssets: 0,
    };

    stations.forEach(station => {
      if (station.type === 'SEA') {
        counts.sea++;
      } else {
        counts.river++;
      }
      
     
    });

    return counts;
  }, [stations]);

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

  const handleStationDeleted = (deletedStationId: string) => {
    // Handle pagination if current page becomes empty
    const newTotalItems = filteredStations.length - 1;
    const maxPage = Math.max(0, Math.ceil(newTotalItems / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const handleImport = () => {
    console.log('Import stations from CSV');
    // TODO: Implement CSV import functionality
  };

  const handleExport = () => {
    console.log('Export stations to CSV');
    // TODO: Implement CSV export functionality
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load stations. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!stations && isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!stations) return <></>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Station Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip 
              label={`Total: ${statusCounts.total} stations`}
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
              label={`With Assets: ${statusCounts.withAssets}`}
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
            disabled={isLoading || filteredStations.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            component={Link}
            href={`${paths.dashboard.stations}/new`}
            startIcon={<PlusIcon size={20} />}
            variant="contained"
            disabled={isLoading}
          >
            Create Station
          </Button>
        </Stack>
      </Stack>

      {/* Filters Section */}
      <StationFilters
        filters={filters}
        onChange={handleFilterChange}
        totalCount={stations.length}
        filteredCount={filteredStations.length}
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
        <StationTable
          count={filteredStations.length}
          page={page}
          rows={paginatedStations}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onStationDeleted={handleStationDeleted}
        />
      )}

      {/* Create Dialog */}
      <StationForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
}