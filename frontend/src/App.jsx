import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RBACRoute from './components/RBACRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MenuList from './pages/MenuList';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantMenu from './pages/MerchantMenu';
import MerchantOrders from './pages/MerchantOrders';
import RolePermissionManagement from './pages/RolePermissionManagement';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<MenuList />} />
        
        {/* Customer routes */}
        <Route
          path="/cart"
          element={
            <RBACRoute requiredRole="customer">
              <Cart />
            </RBACRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <RBACRoute requiredRole="customer">
              <Orders />
            </RBACRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RBACRoute requiredRole="customer">
              <OrderDetail />
            </RBACRoute>
          }
        />
        
        {/* Merchant routes */}
        <Route
          path="/merchant/dashboard"
          element={
            <RBACRoute requiredRole="merchant">
              <MerchantDashboard />
            </RBACRoute>
          }
        />
        <Route
          path="/merchant/menu"
          element={
            <RBACRoute requiredRole="merchant">
              <MerchantMenu />
            </RBACRoute>
          }
        />
        <Route
          path="/merchant/orders"
          element={
            <RBACRoute requiredRole="merchant">
              <MerchantOrders />
            </RBACRoute>
          }
        />
        
        {/* Super Admin routes */}
        <Route
          path="/superadmin/rbac"
          element={
            <RBACRoute requiredRole="superadmin">
              <RolePermissionManagement />
            </RBACRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;

