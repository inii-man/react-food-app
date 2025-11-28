import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
  Container,
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { logout } from "../store/slices/authSlice";

function Layout({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            Food App
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="secondary"
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                {user?.role === "customer" && (
                  <>
                    <Button
                      component={Link}
                      to="/menu"
                      color="inherit"
                    >
                      Menu
                    </Button>
                    <Button
                      component={Link}
                      to="/cart"
                      color="inherit"
                      startIcon={
                        <Badge badgeContent={cartItemCount} color="error">
                          <ShoppingCartIcon />
                        </Badge>
                      }
                    >
                      Cart
                    </Button>
                    <Button
                      component={Link}
                      to="/orders"
                      color="inherit"
                    >
                      My Orders
                    </Button>
                  </>
                )}

                {user?.role === "merchant" && (
                  <>
                    <Button
                      component={Link}
                      to="/merchant/dashboard"
                      color="inherit"
                    >
                      Dashboard
                    </Button>
                    <Button
                      component={Link}
                      to="/merchant/menu"
                      color="inherit"
                    >
                      Manage Menu
                    </Button>
                    <Button
                      component={Link}
                      to="/merchant/orders"
                      color="inherit"
                    >
                      Orders
                    </Button>
                  </>
                )}

                {(user?.roles?.includes('superadmin') || user?.role === 'superadmin') && (
                  <Button
                    component={Link}
                    to="/superadmin/rbac"
                    color="inherit"
                    sx={{ fontWeight: 'bold' }}
                  >
                    RBAC Management
                  </Button>
                )}

                <Typography variant="body2" sx={{ px: 1 }}>
                  {user?.name}
                </Typography>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="secondary"
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
