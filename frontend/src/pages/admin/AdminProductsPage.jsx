import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Pencil, Search, Power } from 'lucide-react';
import * as productsService from '../../services/products.service';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorBox from '../../components/ErrorBox';
import { formatCurrency, urlImagen } from '../../utils/format';

export default function AdminProductsPage() {
  const [productos, setProductos] = useState([]);
  const [incluirInactivos, setIncluirInactivos] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const debounceRef = useRef(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (incluirInactivos) params.incluirInactivos = 'true';
      if (busqueda.trim()) params.search = busqueda.trim();
      const res = await productsService.getProducts(params);
      setProductos(res.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [busqueda, incluirInactivos]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(cargar, 250);
    return () => clearTimeout(debounceRef.current);
  }, [cargar]);

  async function toggleStatus(producto) {
    try {
      await productsService.patchProductStatus(producto.id, !producto.activo);
      setAviso(`"${producto.nombre}" ${producto.activo ? 'inactivado' : 'activado'} (historial conservado)`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary"><PackagePlus size={16} /> Nuevo producto</Link>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar por nombre o marca…"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <label className="filter-check">
          <input
            type="checkbox"
            checked={incluirInactivos}
            onChange={(event) => setIncluirInactivos(event.target.checked)}
          />
          Mostrar inactivos
        </label>
      </div>
      {error && <ErrorBox message={error} />}
      {aviso && <p className="info-box">{aviso}</p>}

      {loading ? (
        <Spinner label="Cargando productos…" />
      ) : productos.length === 0 ? (
        <EmptyState title="No hay productos" message="Crea el primer producto del catálogo." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Existencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className={producto.activo ? '' : 'row-inactive'}>
                  <td>
                    <div className="cell-product">
                      <span className="cell-image">
                        {producto.imagen ? <img src={urlImagen(producto.imagen)} alt="" /> : null}
                      </span>
                      <div>
                        <strong>{producto.nombre}</strong>
                        <small>{producto.marca?.nombre}</small>
                      </div>
                    </div>
                  </td>
                  <td>{producto.categoria?.nombre}</td>
                  <td>
                    {producto.descuento > 0 ? (
                      <>
                        <span className="price-old">{formatCurrency(producto.precio)}</span>{' '}
                        <strong>{formatCurrency(producto.precioFinal)}</strong>
                      </>
                    ) : (
                      formatCurrency(producto.precio)
                    )}
                  </td>
                  <td>
                    <span className={producto.stock <= 5 ? 'text-danger' : ''}>{producto.stock}</span>
                  </td>
                  <td>
                    <span className={`badge ${producto.activo ? 'badge-success' : 'badge-danger'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/productos/${producto.id}/editar`} className="icon-btn" aria-label={`Editar ${producto.nombre}`} title="Editar">
                        <Pencil size={15} />
                      </Link>
                      <button type="button" className={`icon-btn ${producto.activo ? 'danger' : 'success'}`} onClick={() => toggleStatus(producto)} aria-label={producto.activo ? 'Inactivar' : 'Activar'} title={producto.activo ? 'Inactivar' : 'Activar'}>
                        <Power size={15} />
                      </button>
                    </div>
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

