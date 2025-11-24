import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';

// Admin
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import ProductFormUnified from './pages/admin/ProductFormUnified';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import AttributesManagement from './pages/admin/AttributesManagement';
import OrdersManagement from './pages/admin/OrdersManagement';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Customer routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <ProductsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute adminOnly>
                  <ProductFormUnified />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <ProtectedRoute adminOnly>
                  <ProductFormUnified />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute adminOnly>
                  <CategoriesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attributes"
              element={
                <ProtectedRoute adminOnly>
                  <AttributesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <OrdersManagement />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/products" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

