import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { fetchOrderById } from '../store/slices/orderSlice';
import { formatRupiah } from '../utils/formatCurrency';

function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (!currentOrder) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Order Details
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Order #{currentOrder.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {new Date(currentOrder.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            color={getStatusColor(currentOrder.status)}
            size="large"
          />
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Order Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentOrder.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {item.menu?.name || 'Menu Item'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatRupiah(item.price)}
                  </TableCell>
                  <TableCell align="center">
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatRupiah(parseFloat(item.price) * item.quantity)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Total:
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {formatRupiah(currentOrder.totalPrice)}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default OrderDetail;
