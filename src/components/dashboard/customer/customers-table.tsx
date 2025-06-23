// src/components/dashboard/customer/customers-table.tsx
"use client";

import RouterLink from "next/link";
import { JSX, useMemo, useState, useContext } from "react";
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
  MapPin as LocationIcon,
  Envelope as EmailIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useSelection } from "@/hooks/use-selection";
import { Customer } from "@/types/customer";
import { useCustomer } from "@/hooks/use-customer";

interface CustomersTableProps {
  count: number;
  page: number;
  rows: Customer[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomerDeleted?: (deletedCustomerId: string) => void;
}

function CustomerAvatar({ customer }: { customer: Customer }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
      {getInitials(customer.name)}
    </Avatar>
  );
}

export function CustomersTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onCustomerDeleted,
}: CustomersTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Customer context for delete operations
  const { deleteCustomer, refetch } = useCustomer();

  const rowIds = useMemo(() => {
    return rows.map((customer) => customer.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    if (!deleteCustomer) {
      console.error('Delete function not available from CustomerContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete);
      
      if (onCustomerDeleted) {
        onCustomerDeleted(customerToDelete);
      }

      if (refetch) {
        await refetch();
      }
      
      console.log(`Customer ${customerToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const getCustomerToDeleteName = () => {
    if (!customerToDelete) return '';
    const customer = rows.find(c => c.id === customerToDelete);
    return customer?.name || customerToDelete;
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
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Stations</TableCell>
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
                    
                    {/* Customer Info */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CustomerAvatar customer={row} />
                        <Box>
                          <Box component={RouterLink} href={`/dashboard/customers/${row.id}`}>
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

                    {/* Contact Info */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon size={14} />
                          <Typography variant="body2">
                            {row.email}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Address */}
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {row.address}
                      </Typography>
                    </TableCell>

                    {/* Stations */}
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {row.stations && row.stations.length > 0 ? (
                          <>
                            {row.stations.slice(0, 2).map((station) => (
                              <Chip
                                key={station.id}
                                label={station.name}
                                color={station.type === 'SEA' ? 'primary' : 'secondary'}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {row.stations.length > 2 && (
                              <Chip
                                label={`+${row.stations.length - 2} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No stations
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Tooltip title="Delete Customer">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(row.id)}
                          size="small"
                          disabled={isDeleting || !deleteCustomer}
                        >
                          <TrashIcon size={18} />
                        </IconButton>
                      </Tooltip>
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
          Confirm Delete Customer
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete customer "{getCustomerToDeleteName()}"? 
            This will also remove all station associations. This action cannot be undone.
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
            {isDeleting ? 'Deleting...' : 'Delete Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}