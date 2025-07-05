// src/components/order/order-table.tsx
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
  PencilSimple as EditIcon,
  ArrowRight as ArrowRightIcon,
  Package as PackageIcon,
  Calendar as CalendarIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useSelection } from "@/hooks/use-selection";
import { Order } from "@/types/order";
import { useOrderContext } from "@/contexts/order-context";
import { useEntityNames } from "@/hooks/use-entity-names";


interface OrderTableProps {
  count: number;
  page: number;
  rows: Order[];
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOrderDeleted?: (deletedOrderId: string) => void;
}

function OrderAvatar({ order }: { order: Order }) {
  const getAvatarColor = (type: string) => {
    return type === 'IMPORT' ? 'primary.main' : 'secondary.main';
  };
  
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(order.type) }}>
      <PackageIcon size={20} />
    </Avatar>
  );
}

function getOrderStatus(order: Order): { status: string; color: 'success' | 'warning' | 'error' } {
  const now = new Date();
  const startDate = new Date(order.startDateTime);
  const dueDate = new Date(order.dueDateTime);
  
  if (dueDate < now) {
    return { status: 'Overdue', color: 'error' };
  } else if (startDate <= now && dueDate >= now) {
    return { status: 'In Progress', color: 'warning' };
  } else {
    return { status: 'Scheduled', color: 'success' };
  }
}

function formatDateTime(dateTime: string | Date): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  
  const { deleteOrder, refetch } = useOrderContext();
  const { 
    getStationName, 
    getCustomerName, 
    getCarrierName, 
    getStationInfo,
    isLoading: isNamesLoading 
  } = useEntityNames();

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

    if (!deleteOrder) {
      console.error('Delete function not available from OrderContext');
      alert('Delete functionality is not available');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete);
      
      if (onOrderDeleted) {
        onOrderDeleted(orderToDelete);
      }

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

  const getOrderToDeleteName = () => {
    if (!orderToDelete) return '';
    const order = rows.find(o => o.id === orderToDelete);
    return order?.productName || orderToDelete;
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
                <TableCell>Order</TableCell>
                <TableCell>Route & Stations</TableCell>
                <TableCell>Demand & Rate</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.has(row.id);
                const statusInfo = getOrderStatus(row);
                const startStationInfo = getStationInfo(row.startStationId);
                const destStationInfo = getStationInfo(row.destStationId);

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

                    {/* Order Info Column */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <OrderAvatar order={row} />
                        <Box>
                          <Box component={RouterLink} href={`/orders/${row.id}`}>
                            <Link>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {row.productName}
                              </Typography>
                            </Link>
                          </Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              ID: {row.id}
                            </Typography>
                            <Chip
                              label={row.type}
                              color={row.type === 'IMPORT' ? 'primary' : 'secondary'}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Enhanced Route & Stations Column */}
                    <TableCell>
                      <Stack spacing={1}>
                        {/* From/To Points (Customer/Carrier Names) */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            { row.type === 'IMPORT' ? getCarrierName(row.fromEntityId) : getCustomerName(row.fromEntityId)}
                          </Typography>
                          <ArrowRightIcon size={14} />
                          <Typography variant="body2" fontWeight="medium" color="secondary">
                            { row.type === 'IMPORT' ? getCustomerName(row.destEntityId) : getCarrierName(row.destEntityId)}
                          </Typography>
                        </Stack>
                        
                        {/* Station Names with Type Indicators */}
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              From:
                            </Typography>
                            <Typography variant="caption" fontWeight="medium">
                              {getStationName(row.startStationId)}
                            </Typography>
                            {startStationInfo && (
                              <Chip
                                label={startStationInfo.type}
                                color={startStationInfo.type === 'SEA' ? 'primary' : 'secondary'}
                                size="small"
                                variant="outlined"
                                sx={{ height: 16, fontSize: '0.625rem' }}
                              />
                            )}
                          </Stack>
                          
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              To:
                            </Typography>
                            <Typography variant="caption" fontWeight="medium">
                              {getStationName(row.destStationId)}
                            </Typography>
                            {destStationInfo && (
                              <Chip
                                label={destStationInfo.type}
                                color={destStationInfo.type === 'SEA' ? 'primary' : 'secondary'}
                                size="small"
                                variant="outlined"
                                sx={{ height: 16, fontSize: '0.625rem' }}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </TableCell>

                    {/* Demand & Rate Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Demand: {row.demand.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rate: {row.loadingRate.toLocaleString()}/hr
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Est: {Math.ceil(row.demand / row.loadingRate)}h
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Schedule Column */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon size={16} />
                          <Typography variant="body2">
                            {formatDateTime(row.startDateTime)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDateTime(row.dueDateTime)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      <Chip
                        label={statusInfo.status}
                        color={statusInfo.color}
                        size="small"
                      />
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Order">
                          <IconButton
                            component={RouterLink}
                            href={`/orders/${row.id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                            size="small"
                            disabled={isDeleting || !deleteOrder}
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
          Confirm Delete Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete order for "{getOrderToDeleteName()}"? 
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
            {isDeleting ? 'Deleting...' : 'Delete Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}