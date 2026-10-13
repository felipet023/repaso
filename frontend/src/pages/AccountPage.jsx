import { Link, useNavigate } from 'react-router-dom';
import { Bike, LogOut, Mail, Shield, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <main className="page narrow-page">
      <header className="page-header">
        <h1>Mi cuenta</h1>
        <p className="muted">Información de tu perfil en TUKI BIKES.</p>
      </header>

      <div className="card account-card">
        <div className="account-avatar">
          <Bike size={30} />
        </div>
        <dl className="account-details">
          <div>
            <dt><User size={15} /> Nombre</dt>
            <dd>{user.nombre}</dd>
          </div>
          <div>
            <dt><Mail size={15} /> Correo</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt><Shield size={15} /> Rol</dt>
            <dd><span className={user.rol === 'admin' ? 'rol-admin' : 'rol-cliente'}>{user.rol === 'admin' ? 'Administrador' : 'Cliente'}</span></dd>
          </div>
        </dl>

        <div className="account-links">
          <Link to="/mis-pedidos" className="btn-primary">Mis pedidos</Link>
          <Link to="/carrito" className="btn-secondary">Mi carrito</Link>
          {user.rol === 'admin' && <Link to="/admin" className="btn-secondary">Panel de administración</Link>}
          <button type="button" className="btn-secondary" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
