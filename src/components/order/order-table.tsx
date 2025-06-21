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
  DialogContentText
} from "@mui/material";
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TablePagination 
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { BoxArrowUp } from "@phosphor-icons/react/dist/ssr";
import { BoxArrowDown } from "@phosphor-icons/react/dist/ssr";

import { useSelection } from "@/hooks/use-selection";
import { Order } from "@/types/order";
import { OrderContext } from "@/contexts/order-context";

interface OrderTableProps {
  count: number;
  page: number;
  rows: Order[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOrderDeleted?: (deletedOrderId: string) => void;
}

export function OrderTable({
  count,
  page,
  rows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onOrderDeleted,
}: OrderTableProps): JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use OrderContext for delete operations instead of direct axios
  const { deleteById, refetch } = useContext(OrderContext);

  const rowIds = useMemo(() => {
    return rows.map((order) => order.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    // Check if deleteById function is available from context
    if (!deleteById) {
      console.error('Delete function not available from OrderContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      // Use OrderContext deleteById method instead of direct axios call
      await deleteById(orderToDelete);
      
      // Call the callback to notify parent component
      if (onOrderDeleted) {
        onOrderDeleted(orderToDelete);
      }

      // The OrderContext deleteById already handles refetch internally
      // But we can call it again to ensure fresh data
      if (refetch) {
        await refetch();
      }
      
      console.log(`Order ${orderToDelete} deleted successfully`);
      
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
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
                <TableCell>Product</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Demand</TableCell>
                <TableCell>Type</TableCell>
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
                    <TableCell>
                      <Box component={RouterLink} href={`orders/${row.id}`}>
                        <Link>
                          <Typography variant="subtitle2">{row.productName}</Typography>
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.fromPoint} 
                        <ArrowRightIcon size={12} /> 
                        {row.destPoint}
                      </Box>
                    </TableCell>
                    <TableCell>{row.demand}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {row.type}
                        {row.type === 'import' ? <BoxArrowDown size={16} /> : <BoxArrowUp size={16} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete Order">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(row.id)}
                          size="small"
                          disabled={isDeleting || !deleteById} // Disable if no delete function available
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
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this order? This action cannot be undone.
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
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}