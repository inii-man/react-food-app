import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchOrders, clearError } from '../store/slices/orderSlice';
import { formatRupiah } from '../utils/formatCurrency';

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
    return () => {
      dispatch(clearError());
    };
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

  const columns = [
    { field: 'id', headerName: 'Order ID', width: 100 },
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/orders/${params.row.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        My Orders
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You have no orders yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/menu')}
            sx={{ mt: 2 }}
          >
            Browse Menu
          </Button>
        </Box>
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
            getRowId={(row) => row.id}
          />
        </Box>
      )}
    </Container>
  );
}

export default Orders;
