import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../store/slices/cartSlice";
import { fetchMenus } from "../store/slices/menuSlice";
import { createOrder, fetchOrders } from "../store/slices/orderSlice";
import { formatRupiah } from "../utils/formatCurrency";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { menus } = useSelector((state) => state.menu);
  const { loading: orderLoading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchMenus());
  }, [dispatch]);

  const cartItemsWithDetails = useMemo(() => {
    return items
      .map((item) => {
        const menu = menus.find((m) => m.id === item.menuId);
        return {
          ...item,
          menu,
        };
      })
      .filter((item) => item.menu);
  }, [items, menus]);

  const totalPrice = useMemo(() => {
    return cartItemsWithDetails.reduce((sum, item) => {
      return sum + parseFloat(item.menu.price) * item.quantity;
    }, 0);
  }, [cartItemsWithDetails]);

  const handleUpdateQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(menuId));
    } else {
      dispatch(updateCartItem({ menuId, quantity: newQuantity }));
    }
  };

  const handleRemove = (menuId) => {
    dispatch(removeFromCart(menuId));
  };

  const handleCheckout = async () => {
    if (cartItemsWithDetails.length === 0) {
      alert("Cart is empty");
      return;
    }

    const orderItems = cartItemsWithDetails.map((item) => ({
      menuId: item.menuId,
      quantity: item.quantity,
    }));

    try {
      await dispatch(createOrder(orderItems)).unwrap();
      dispatch(clearCart());
      // Fetch orders to ensure the list is up to date
      await dispatch(fetchOrders());
      // Navigate to orders page
      navigate("/orders");
    } catch (error) {
      alert("Failed to create order: " + (error.message || error));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading cart...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Shopping Cart
      </Typography>

      {cartItemsWithDetails.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/menu")}
            sx={{ mt: 2 }}
          >
            Browse Menu
          </Button>
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItemsWithDetails.map((item) => (
                  <TableRow key={item.menuId}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {item.menu.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatRupiah(item.menu.price)} each
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatRupiah(item.menu.price)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.menuId, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.menuId, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatRupiah(parseFloat(item.menu.price) * item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemove(item.menuId)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatRupiah(totalPrice)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCheckout}
              disabled={orderLoading}
              sx={{ py: 1.5 }}
            >
              {orderLoading ? "Processing..." : "Place Order"}
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default Cart;
