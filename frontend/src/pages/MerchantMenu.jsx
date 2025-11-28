import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../store/slices/menuSlice';
import { formatRupiah } from '../utils/formatCurrency';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least 0.01'),
  image: Yup.string()
    .url('Must be a valid URL')
    .trim(),
});

function MerchantMenu() {
  const dispatch = useDispatch();
  const { menus, loading } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const merchantMenus = menus.filter((menu) => menu.merchantId === user?.id);

  const handleOpen = (menu = null) => {
    setEditingMenu(menu);
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMenu(null);
    setError(null);
  };

  const handleSubmit = async (values) => {
    try {
      setError(null);
      if (editingMenu) {
        await dispatch(updateMenu({ id: editingMenu.id, ...values })).unwrap();
      } else {
        await dispatch(createMenu(values)).unwrap();
      }
      handleClose();
      dispatch(fetchMenus());
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await dispatch(deleteMenu(id)).unwrap();
        dispatch(fetchMenus());
      } catch (err) {
        alert('Error: ' + (err.message || err));
      }
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpen(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Menu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Menu Item
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={merchantMenus}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          autoHeight={false}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <Formik
          initialValues={{
            name: editingMenu?.name || '',
            description: editingMenu?.description || '',
            price: editingMenu?.price || '',
            image: editingMenu?.image || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <Field name="name">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Name"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      margin="normal"
                      required
                    />
                  )}
                </Field>
                
                <Field name="description">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      margin="normal"
                    />
                  )}
                </Field>
                
                <Field name="price">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Price"
                      type="number"
                      inputProps={{ step: '0.01', min: '0.01' }}
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      margin="normal"
                      required
                    />
                  )}
                </Field>
                
                <Field name="image">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Image URL"
                      type="url"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      margin="normal"
                    />
                  )}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {editingMenu ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Container>
  );
}

export default MerchantMenu;
