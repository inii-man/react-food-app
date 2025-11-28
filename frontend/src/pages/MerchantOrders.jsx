import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { formatRupiah } from '../utils/formatCurrency';

function MerchantOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      delivered: 'default',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
    };
    return statusFlow[currentStatus];
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      dispatch(fetchOrders());
    } catch (error) {
      alert('Error updating status: ' + (error.message || error));
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const columns = [
    { field: 'id', headerName: 'Order ID', width: 100 },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => params.value?.name || 'Unknown',
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 200,
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 150,
      renderCell: (params) => `${params.value?.length || 0} item(s)`,
    },
    {
      field: 'totalPrice',
      headerName: 'Total',
      width: 150,
      renderCell: (params) => formatRupiah(params.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        const nextStatus = getNextStatus(params.row.status);
        const canUpdate = nextStatus && params.row.status !== 'delivered' && params.row.status !== 'cancelled';
        
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleViewDetails(params.row)}
            >
              View
            </Button>
            {canUpdate && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleStatusUpdate(params.row.id, nextStatus)}
              >
                Mark as {nextStatus?.charAt(0).toUpperCase() + nextStatus?.slice(1)}
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Orders
      </Typography>
      
      {orders.length === 0 && !loading ? (
        <Typography variant="body1" align="center" color="text.secondary">
          No orders yet
        </Typography>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={orders}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            autoHeight={false}
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Order #{selectedOrder?.id} Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Customer:</strong> {selectedOrder.customer?.name || 'Unknown'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  color={getStatusColor(selectedOrder.status)}
                  size="small"
                />
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Items:
              </Typography>
              <List>
                {selectedOrder.items?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={item.menu?.name || 'Menu Item'}
                      secondary={`${formatRupiah(item.price)} × ${item.quantity} = ${formatRupiah(parseFloat(item.price) * item.quantity)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" align="right">
                Total: {formatRupiah(selectedOrder.totalPrice)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MerchantOrders;
