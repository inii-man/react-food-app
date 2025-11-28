import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';

function MerchantDashboard() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Merchant Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            component={Link}
            to="/merchant/menu"
            sx={{
              p: 4,
              textDecoration: 'none',
              display: 'block',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Manage Menu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add, edit, or delete menu items
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            component={Link}
            to="/merchant/orders"
            sx={{
              p: 4,
              textDecoration: 'none',
              display: 'block',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              View Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and update order status
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MerchantDashboard;
