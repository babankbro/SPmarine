// src/components/dashboard/barge/barge-table.tsx
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
} from "@phosphor-icons/react/dist/ssr";
import dayjs from "dayjs";

import { useSelection } from "@/hooks/use-selection";
import { Barge } from "@/types/barge";
import { useBarge } from "@/hooks/use-barge";

interface BargeTableProps {
  count: number;
  page: number;
  rows: Barge[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBargeDeleted?: (deletedBargeId: string) => void;
}

function BargeAvatar({ barge }: { barge: Barge }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (waterStatus: string) => {
    return waterStatus === 'SEA' ? 'primary.main' : 'secondary.main';
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(barge.waterStatus) }}>
      <BoatIcon size={20} />
    </Avatar>
  );
}

function isBargeReady(barge: Barge): boolean {
  if (!barge.readyDatetime) return false;
  return new Date(barge.readyDatetime) <= new Date();
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

export function BargeTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onBargeDeleted,
}: BargeTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bargeToDelete, setBargeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Barge context for delete operations
  const { deleteBarge, refetch } = useBarge();

  const rowIds = useMemo(() => {
    return rows.map((barge) => barge.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (bargeId: string) => {
    setBargeToDelete(bargeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bargeToDelete) return;

    if (!deleteBarge) {
      console.error('Delete function not available from BargeContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBarge(bargeToDelete);
      
      if (onBargeDeleted) {
        onBargeDeleted(bargeToDelete);
      }

      if (refetch) {
        await refetch();
      }
      
      console.log(`Barge ${bargeToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete barge:', error);
      alert('Failed to delete barge. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBargeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBargeToDelete(null);
  };

  const getBargeToDeleteName = () => {
    if (!bargeToDelete) return '';
    const barge = rows.find(b => b.id === bargeToDelete);
    return barge?.name || bargeToDelete;
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      event.target.checked ? selectAll() : deselectAll();
                    }}
                  />
                </TableCell>
                <TableCell>Barge</TableCell>
                <TableCell>Specifications</TableCell>
                <TableCell>Location & Status</TableCell>
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.target.checked ? selectOne(row.id) : deselectOne(row.id);
                        }}
                      />
                    </TableCell>
                    
                    {/* Barge Info Column */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <BargeAvatar barge={row} />
                        <Box>
                          <Box component={RouterLink} href={`/dashboard/barges/${row.id}`}>
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

                    {/* Specifications Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Capacity: {row.capacity?.toLocaleString()} tons
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Weight: {row.weight?.toLocaleString()} tons
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Setup: {row.setupTime}h
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Location & Status Column */}
                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          label={row.waterStatus}
                          color={row.waterStatus === 'SEA' ? 'primary' : 'secondary'}
                          size="small"
                          variant="outlined"
                        />
                        {row.latitude && row.longitude && (
                          <Typography variant="caption" color="text.secondary">
                            {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                          </Typography>
                        )}
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
                            {row.station.type} • {row.distanceKm}km
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
                          label={isBargeReady(row) ? 'Ready' : 'Not Ready'}
                          color={isBargeReady(row) ? 'success' : 'warning'}
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
                        <Tooltip title="Edit Barge">
                          <IconButton
                            component={RouterLink}
                            href={`/dashboard/barges/${row.id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Barge">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                            size="small"
                            disabled={isDeleting || !deleteBarge}
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
          Confirm Delete Barge
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete barge "{getBargeToDeleteName()}"? 
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
            {isDeleting ? 'Deleting...' : 'Delete Barge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}