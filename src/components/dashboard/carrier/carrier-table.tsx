// src/components/dashboard/carrier/carrier-table.tsx
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
  Anchor  as ShipIcon,
  Factory as FactoryIcon,
} from "@phosphor-icons/react/dist/ssr";

//import { Ship as ShipIcon} from "@phosphor-icons/react";

import { useSelection } from "@/hooks/use-selection";
import { Carrier } from "@/types/carrier";
import { useCarrier } from "@/hooks/use-carrier";

interface CarrierTableProps {
  count: number;
  page: number;
  rows: Carrier[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCarrierDeleted?: (deletedCarrierId: string) => void;
}

function CarrierAvatar({ carrier }: { carrier: Carrier }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
      <ShipIcon size={20} />
    </Avatar>
  );
}

export function CarrierTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onCarrierDeleted,
}: CarrierTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carrierToDelete, setCarrierToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Carrier context for delete operations
  const { deleteCarrier, refetch } = useCarrier();

  const rowIds = useMemo(() => {
    return rows.map((carrier) => carrier.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (carrierId: string) => {
    setCarrierToDelete(carrierId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!carrierToDelete) return;

    if (!deleteCarrier) {
      console.error('Delete function not available from CarrierContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCarrier(carrierToDelete);
      
      if (onCarrierDeleted) {
        onCarrierDeleted(carrierToDelete);
      }

      if (refetch) {
        await refetch();
      }
      
      console.log(`Carrier ${carrierToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete carrier:', error);
      alert('Failed to delete carrier. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCarrierToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCarrierToDelete(null);
  };

  const getCarrierToDeleteName = () => {
    if (!carrierToDelete) return '';
    const carrier = rows.find(c => c.id === carrierToDelete);
    return carrier?.name || carrierToDelete;
  };

  return (
    <>
      <Card>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell>Carrier</TableCell>
                <TableCell>Company & Specifications</TableCell>
                <TableCell>Capacity & Equipment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.id);

                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    {/* Carrier Info Column */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CarrierAvatar carrier={row} />
                        <Box>
                          <Box component={RouterLink} href={`/dashboard/carriers/${row.id}`}>
                            <Link>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {row.name}
                              </Typography>
                            </Link>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Carrier ID: {row.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Company & Specifications Column */}
                    <TableCell>
                      <Stack spacing={1}>
                        {row.holder && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <FactoryIcon size={16} color="text.secondary" />
                            <Typography variant="body2" fontWeight="medium">
                              {row.holder}
                            </Typography>
                          </Stack>
                        )}
                        {row.numberOfBulks && (
                          <Typography variant="body2" color="text.secondary">
                            {row.numberOfBulks} compartments
                          </Typography>
                        )}
                        {!row.holder && !row.numberOfBulks && (
                          <Typography variant="body2" color="text.secondary">
                            No additional info
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Capacity & Equipment Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        {row.maxCapacity && (
                          <Typography variant="body2" fontWeight="medium">
                            Capacity: {row.maxCapacity?.toLocaleString()} tons
                          </Typography>
                        )}
                        {row.maxCrane && (
                          <Typography variant="body2" color="text.secondary">
                            Max Cranes: {row.maxCrane}
                          </Typography>
                        )}
                        {!row.maxCapacity && !row.maxCrane && (
                          <Typography variant="body2" color="text.secondary">
                            Specs not available
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Carrier">
                          <IconButton
                            component={RouterLink}
                            href={`/dashboard/carriers/${row.id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Carrier">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                            size="small"
                            disabled={isDeleting || !deleteCarrier}
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
          rowsPerPageOptions={[5, 10, 25, 50, 100, { label: 'All', value: -1 }]}
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
          Confirm Delete Carrier
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete carrier "{getCarrierToDeleteName()}"? 
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
            {isDeleting ? 'Deleting...' : 'Delete Carrier'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}