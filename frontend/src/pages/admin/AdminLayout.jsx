import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Package, Users } from 'lucide-react';

const SECCIONES = [
  { to: '/admin/productos', label: 'Productos', icono: Package },
  { to: '/admin/usuarios', label: 'Usuarios', icono: Users },
  { to: '/admin/reportes', label: 'Reportes', icono: BarChart3 }
];

export default function AdminLayout() {
  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LayoutDashboard size={22} />
          <span>Panel admin</span>
        </div>
        <nav className="admin-nav">
          {SECCIONES.map((seccion) => (
            <NavLink
              key={seccion.to}
              to={seccion.to}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
            >
              <seccion.icono size={18} /> {seccion.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </main>
  );
}
