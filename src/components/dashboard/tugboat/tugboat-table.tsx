// src/components/dashboard/tugboat/tugboat-table.tsx
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
  Boat as BoatIcon,
  Engine as EngineIcon,
} from "@phosphor-icons/react/dist/ssr";
import dayjs from "dayjs";

import { useSelection } from "@/hooks/use-selection";
import { Tugboat } from "@/types/tugboat";
import { useTugboat } from "@/hooks/use-tugboat";

interface TugboatTableProps {
  count: number;
  page: number;
  rows: Tugboat[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTugboatDeleted?: (deletedTugboatId: string) => void;
}

function TugboatAvatar({ tugboat }: { tugboat: Tugboat }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (type: string) => {
    return type === 'SEA' ? 'primary.main' : 'secondary.main';
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(tugboat.type) }}>
      <BoatIcon size={20} />
    </Avatar>
  );
}

function isTugboatReady(tugboat: Tugboat): boolean {
  if (!tugboat.readyDatetime) return false;
  return new Date(tugboat.readyDatetime) <= new Date();
}

function formatDateTime(dateTime: string | Date): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function TugboatTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onTugboatDeleted,
}: TugboatTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tugboatToDelete, setTugboatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Tugboat context for delete operations
  const { deleteTugboat, refetch } = useTugboat();

  const rowIds = useMemo(() => {
    return rows.map((tugboat) => tugboat.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (tugboatId: string) => {
    setTugboatToDelete(tugboatId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tugboatToDelete) return;

    if (!deleteTugboat) {
      console.error('Delete function not available from TugboatContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTugboat(tugboatToDelete);
      
      if (onTugboatDeleted) {
        onTugboatDeleted(tugboatToDelete);
      }

      if (refetch) {
        await refetch();
      }
      
      console.log(`Tugboat ${tugboatToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete tugboat:', error);
      alert('Failed to delete tugboat. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTugboatToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTugboatToDelete(null);
  };

  const getTugboatToDeleteName = () => {
    if (!tugboatToDelete) return '';
    const tugboat = rows.find(t => t.id === tugboatToDelete);
    return tugboat?.name || tugboatToDelete;
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell>Tugboat</TableCell>
                <TableCell>Engine & Performance</TableCell>
                <TableCell>Capacity & Type</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Ready Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.id);

                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    {/* Tugboat Info Column */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <TugboatAvatar tugboat={row} />
                        <Box>
                          <Box component={RouterLink} href={`/dashboard/tugboats/${row.id}`}>
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

                    {/* Engine & Performance Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EngineIcon size={16} color="text.secondary" />
                          <Typography variant="body2">
                            {row.horsePower?.toLocaleString()} HP
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Speed: {row.minSpeed} - {row.maxSpeed} knots
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          RPM: {row.engineRpm?.toLocaleString()}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Capacity & Type Column */}
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Capacity: {row.maxCapacity?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Max Barges: {row.maxBarge}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={row.type}
                            color={row.type === 'SEA' ? 'primary' : 'secondary'}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={row.waterStatus}
                            color={row.waterStatus === 'SEA' ? 'info' : 'warning'}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Station Column */}
                    <TableCell>
                      {row.station ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight="medium">
                            {row.station.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.station.type} • {row.station.distanceKm}km
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No station assigned
                        </Typography>
                      )}
                    </TableCell>

                    {/* Ready Status Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={isTugboatReady(row) ? 'Ready' : 'Not Ready'}
                          color={isTugboatReady(row) ? 'success' : 'warning'}
                          size="small"
                        />
                        {row.readyDatetime && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(row.readyDatetime)}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Tugboat">
                          <IconButton
                            component={RouterLink}
                            href={`/dashboard/tugboats/${row.id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Tugboat">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                            size="small"
                            disabled={isDeleting || !deleteTugboat}
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
          Confirm Delete Tugboat
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete tugboat "{getTugboatToDeleteName()}"? 
            This action cannot be undone.
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
            {isDeleting ? 'Deleting...' : 'Delete Tugboat'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}