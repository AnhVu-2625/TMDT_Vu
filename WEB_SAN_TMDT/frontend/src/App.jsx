import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import SellerLayout from './layouts/SellerLayout';

// Public Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminShops from './pages/admin/Shops.jsx';
import AdminModeration from './pages/admin/Moderation.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminDisputes from './pages/admin/Disputes.jsx';
import AdminSettlement from './pages/admin/Settlement.jsx';
import AdminStatistics from './pages/admin/Statistics.jsx';
import AdminPolicies from './pages/admin/Policies.jsx';
import AdminNotifications from './pages/admin/Notifications.jsx';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard.jsx';

// Store
import { useAuthStore } from './store/authStore';

// ─── Route Guards ───────────────────────────────────────────────────────────

/** Bảo vệ: chỉ user đã đăng nhập */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/** Chỉ cho QUAN_TRI_VIEN */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.vaiTro !== 'QUAN_TRI_VIEN') return <Navigate to="/" replace />;
  return children;
};

/** Chỉ cho user có cửa hàng (shop != null) */
const SellerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.shop?.MaCuaHang) return <Navigate to="/" replace />;
  return children;
};

/** Chỉ cho khách (chưa đăng nhập). Nếu đã đăng nhập → redirect theo vai trò */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
  // Redirect đúng dashboard
  if (user?.vaiTro === 'QUAN_TRI_VIEN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.shop?.MaCuaHang) return <Navigate to="/seller/dashboard" replace />;
  return <Navigate to="/" replace />;
};

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* ── Public / User Routes ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        {/* ── Auth Routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"      element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register"   element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-otp" element={<GuestRoute><VerifyOTP /></GuestRoute>} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/dashboard"     element={<AdminDashboard />} />
          <Route path="/admin/users"         element={<AdminUsers />} />
          <Route path="/admin/shops"         element={<AdminShops />} />
          <Route path="/admin/moderation"    element={<AdminModeration />} />
          <Route path="/admin/reports"       element={<AdminReports />} />
          <Route path="/admin/disputes"      element={<AdminDisputes />} />
          <Route path="/admin/settlement"    element={<AdminSettlement />} />
          <Route path="/admin/statistics"    element={<AdminStatistics />} />
          <Route path="/admin/policies"      element={<AdminPolicies />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* ── Seller Routes ── */}
        <Route element={<SellerRoute><SellerLayout /></SellerRoute>}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
