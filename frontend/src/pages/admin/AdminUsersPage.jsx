import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorBox from '../../components/ErrorBox';
import { formatFecha } from '../../utils/format';

export default function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const debounceRef = useRef(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(busqueda.trim());
      setUsuarios(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(cargar, 250);
    return () => clearTimeout(debounceRef.current);
  }, [cargar]);

  async function cambiarRol(usuario, nuevoRol) {
    if (nuevoRol === usuario.rol) return;
    try {
      await adminService.changeRole(usuario.id_usuario, nuevoRol);
      setAviso(`Rol de ${usuario.nombre} actualizado a "${nuevoRol}"`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActivo(usuario) {
    try {
      await adminService.changeStatus(usuario.id_usuario, !usuario.activo);
      setAviso(`${usuario.activo ? 'Desactivada' : 'Activada'} la cuenta de ${usuario.nombre}`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Usuarios</h1>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {aviso && <p className="info-box">{aviso}</p>}

      {loading ? (
        <Spinner label="Cargando usuarios…" />
      ) : usuarios.length === 0 ? (
        <EmptyState title="No se encontraron usuarios" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Creado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario} className={usuario.activo ? '' : 'row-inactive'}>
                  <td><strong>{usuario.nombre}</strong></td>
                  <td>{usuario.email}</td>
                  <td>
                    <select
                      value={usuario.rol}
                      onChange={(event) => cambiarRol(usuario, event.target.value)}
                      aria-label={`Rol de ${usuario.nombre}`}
                    >
                      <option value="cliente">cliente</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{usuario.pedidos}</td>
                  <td>{formatFecha(usuario.created_at)}</td>
                  <td>
                    <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`icon-btn ${usuario.activo ? 'danger' : 'success'}`}
                      onClick={() => toggleActivo(usuario)}
                      title={usuario.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                      aria-label={usuario.activo ? `Desactivar ${usuario.nombre}` : `Activar ${usuario.nombre}`}
                    >
                      {usuario.activo ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
