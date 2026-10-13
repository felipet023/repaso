import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bike, LogOut, Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/taller', label: 'Taller' },
  { to: '/contacto', label: 'Contacto' }
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <Bike size={24} strokeWidth={2.5} />
          TUKI <span>BIKES</span>
        </Link>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema" title="Cambiar tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <Link to="/carrito" className="icon-btn cart-btn" aria-label="Ver carrito" title="Carrito">
              <ShoppingCart size={18} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          ) : null}

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                {user?.nombre} <strong className={user?.rol === 'admin' ? 'rol-admin' : 'rol-cliente'}>{user?.rol === 'admin' ? 'Admin' : 'Cliente'}</strong>
              </span>
              <button type="button" className="btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">Ingresar</Link>
          )}

          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen((value) => !value)} aria-label="Menú">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
