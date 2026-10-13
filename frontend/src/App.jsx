import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import WorkshopPage from './pages/WorkshopPage';
import AppointmentPage from './pages/AppointmentPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import AccountPage from './pages/AccountPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import './assets/styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="app-shell">
              <Navbar />
              <Routes>
                {/* Públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
                <Route path="/nosotros" element={<AboutPage />} />
                <Route path="/taller" element={<WorkshopPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/terminos" element={<TermsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
                <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />

                {/* Autenticadas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/taller/agendar" element={<AppointmentPage />} />
                  <Route path="/carrito" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/pedido/:id/confirmacion" element={<OrderConfirmationPage />} />
                  <Route path="/mis-pedidos" element={<OrdersPage />} />
                  <Route path="/mi-cuenta" element={<AccountPage />} />
                </Route>

                {/* Administración */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/productos" replace />} />
                    <Route path="productos" element={<AdminProductsPage />} />
                    <Route path="productos/nuevo" element={<ProductFormPage />} />
                    <Route path="productos/:id/editar" element={<ProductFormPage />} />
                    <Route path="usuarios" element={<AdminUsersPage />} />
                    <Route path="reportes" element={<AdminReportsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
