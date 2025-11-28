import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { AddShoppingCart as AddShoppingCartIcon } from '@mui/icons-material';
import { fetchMenus } from '../store/slices/menuSlice';
import { addToCart } from '../store/slices/cartSlice';
import { formatRupiah } from '../utils/formatCurrency';

function MenuList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { menus, loading } = useSelector((state) => state.menu);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleAddToCart = (menuId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ menuId, quantity: 1 }));
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'image', 
      headerName: 'Image', 
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value || '/placeholder.png'}
          alt={params.row.name}
          sx={{
            width: 100,
            height: 100,
            objectFit: 'cover',
            borderRadius: 1,
          }}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      ),
    },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 300,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value || '-'}
        </Box>
      ),
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 150,
      renderCell: (params) => formatRupiah(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => handleAddToCart(params.row.id)}
          size="small"
        >
          <AddShoppingCartIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Menu
      </Typography>
      
      {menus.length === 0 && !loading ? (
        <Typography variant="body1" align="center" color="text.secondary">
          No menu items available
        </Typography>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={menus}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            autoHeight={false}
          />
        </Box>
      )}
    </Container>
  );
}

export default MenuList;
