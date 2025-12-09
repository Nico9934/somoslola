import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from './components/ui/Spinner';

// Auth (critical - no lazy load)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer (critical - no lazy load)
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';

// Customer (lazy load)
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/customer/OrderConfirmation'));
const Orders = lazy(() => import('./pages/customer/Orders'));

// Admin (lazy load - solo se cargan si eres admin)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement'));
const ProductFormUnified = lazy(() => import('./pages/admin/ProductFormUnified'));
const CategoriesManagement = lazy(() => import('./pages/admin/CategoriesManagement'));
const BrandsManagement = lazy(() => import('./pages/admin/BrandsManagement'));
const AttributesManagement = lazy(() => import('./pages/admin/AttributesManagement'));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement'));
const ShippingZonesManagement = lazy(() => import('./pages/admin/ShippingZonesManagement'));
const HeroBannersManagement = lazy(() => import('./pages/admin/HeroBannersManagement'));
const PaymentSettingsManagement = lazy(() => import('./pages/admin/PaymentSettingsManagement'));
const StockNotifications = lazy(() => import('./pages/admin/StockNotifications'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-warm-50">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />

              {/* Customer routes (requieren login) */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
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
                path="/admin/brands"
                element={
                  <ProtectedRoute adminOnly>
                    <BrandsManagement />
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
              <Route
                path="/admin/shipping-zones"
                element={
                  <ProtectedRoute adminOnly>
                    <ShippingZonesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hero-banners"
                element={
                  <ProtectedRoute adminOnly>
                    <HeroBannersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payment-settings"
                element={
                  <ProtectedRoute adminOnly>
                    <PaymentSettingsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stock-notifications"
                element={
                  <ProtectedRoute adminOnly>
                    <StockNotifications />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/products" replace />} />
            </Routes>
          </Suspense>
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

