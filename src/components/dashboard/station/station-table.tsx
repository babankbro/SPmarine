// src/components/dashboard/station/station-table.tsx
"use client";

import RouterLink from "next/link";
import { JSX, useMemo, useState } from "react";
import { 
  Box, 
  Typography, 
  Link, 
  Divider, 
  Card, 
  Checkbox, 
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Chip,
  Stack,
  Avatar
} from "@mui/material";
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TablePagination 
} from "@mui/material";
import { 
  Trash as TrashIcon,
  PencilSimple as EditIcon,
  MapPin as LocationIcon,
  Buildings as BuildingsIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useSelection } from "@/hooks/use-selection";
import { Station } from "@/types/station";
import { useStation } from "@/hooks/use-station";

interface StationTableProps {
  count: number;
  page: number;
  rows: Station[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStationDeleted?: (deletedStationId: string) => void;
}

function StationAvatar({ station }: { station: Station }) {
  const getAvatarColor = (type: string) => {
    return type === 'SEA' ? 'primary.main' : 'secondary.main';
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(station.type) }}>
      <BuildingsIcon size={20} />
    </Avatar>
  );
}

function formatCoordinate(value: number): string {
  return value.toFixed(4);
}

export function StationTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onStationDeleted,
}: StationTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Station context for delete operations
  const { deleteStation, refetch } = useStation();

  const rowIds = useMemo(() => {
    return rows.map((station) => station.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (stationId: string) => {
    setStationToDelete(stationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stationToDelete) return;

    if (!deleteStation) {
      console.error('Delete function not available from StationContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStation(stationToDelete);
      
      if (onStationDeleted) {
        onStationDeleted(stationToDelete);
      }

      if (refetch) {
        await refetch();
      }
      
      console.log(`Station ${stationToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete station:', error);
      alert('Failed to delete station. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setStationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStationToDelete(null);
  };

  const getStationToDeleteName = () => {
    if (!stationToDelete) return '';
    const station = rows.find(s => s.id === stationToDelete);
    return station?.name || stationToDelete;
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>Type & Location</TableCell>
                <TableCell>Coordinates</TableCell>
                <TableCell>River KM</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.id);

                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    {/* Station Info Column */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <StationAvatar station={row} />
                        <Box>
                          <Box component={RouterLink} href={`/dashboard/stations/${row.id}`}>
                            <Link>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {row.name}
                              </Typography>
                            </Link>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            ID: {row.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Type & Location Column */}
                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          label={row.type}
                          color={row.type === 'SEA' ? 'primary' : 'secondary'}
                          size="small"
                          icon={<BuildingsIcon size={16} />}
                        />
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationIcon size={16} color="text.secondary" />
                          <Typography variant="body2" color="text.secondary">
                            {row.type === 'SEA' ? 'Sea Station' : 'River Station'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Coordinates Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Lat: {formatCoordinate(row.latitude)}°
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lng: {formatCoordinate(row.longitude)}°
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Distance Column */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {row.distanceKm} km
                      </Typography>
                    </TableCell>


                    {/* Actions Column */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Station">
                          <IconButton
                            component={RouterLink}
                            href={`/dashboard/stations/${row.id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Station">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                            size="small"
                            disabled={isDeleting || !deleteStation}
                          >
                            <TrashIcon size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete Station
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete station "{getStationToDeleteName()}"? 
            This action cannot be undone and may affect associated barges, tugboats, and customers.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Station'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}