import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';

function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
        Welcome to Food App
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Order delicious food online
      </Typography>
      
      {!isAuthenticated ? (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
          >
            Get Started
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
          >
            Login
          </Button>
        </Box>
      ) : (
        <Box>
          {user?.role === 'customer' ? (
            <Button
              component={Link}
              to="/menu"
              variant="contained"
              color="primary"
              size="large"
            >
              Browse Menu
            </Button>
          ) : (
            <Button
              component={Link}
              to="/merchant/dashboard"
              variant="contained"
              color="primary"
              size="large"
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Home;
