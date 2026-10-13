import { useEffect, useState } from 'react';
import { AlertTriangle, Download, FileSpreadsheet, FileText, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import * as productsService from '../../services/products.service';
import Spinner from '../../components/Spinner';
import ErrorBox from '../../components/ErrorBox';
import { formatCurrency, formatFecha } from '../../utils/format';

export default function AdminReportsPage() {
  const [filtros, setFiltros] = useState({ desde: '', hasta: '', categoria: '' });
  const [datos, setDatos] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getReports().then((res) => {
      setDatos(res.data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
    adminService.getDashboard().then((res) => setAlertas(res.data.alertas_inventario || [])).catch(() => {});
    productsService.getProducts({ limit: 1 }).then((res) => setCategorias(res.filtros?.categorias || [])).catch(() => {});
  }, []);

  function setFiltro(key, value) {
    setFiltros((actual) => ({ ...actual, [key]: value }));
  }

  async function consultar(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      if (filtros.categoria) params.categoria = Number(filtros.categoria);
      const res = await adminService.getReports(params);
      setDatos(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportar(formato) {
    setExportando(formato);
    setError('');
    try {
      const params = {};
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      if (filtros.categoria) params.categoria = Number(filtros.categoria);
      const blob = await adminService.exportReport(params, formato);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-tuki-bikes.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExportando('');
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Reportes</h1>
        <div className="export-actions">
          <button type="button" className="btn-secondary" onClick={() => exportar('excel')} disabled={Boolean(exportando)}>
            <FileSpreadsheet size={16} /> {exportando === 'excel' ? 'Exportando…' : 'Excel'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => exportar('pdf')} disabled={Boolean(exportando)}>
            <FileText size={16} /> {exportando === 'pdf' ? 'Exportando…' : 'PDF'}
          </button>
        </div>
      </div>

      <form onSubmit={consultar} className="card report-filters">
        <div className="field">
          <label htmlFor="desde">Desde</label>
          <input id="desde" type="date" value={filtros.desde} onChange={(event) => setFiltro('desde', event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hasta">Hasta</label>
          <input id="hasta" type="date" value={filtros.hasta} onChange={(event) => setFiltro('hasta', event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" value={filtros.categoria} onChange={(event) => setFiltro('categoria', event.target.value)}>
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </div>
        <div className="actions">
          <button type="submit" className="btn-primary" disabled={loading}><Download size={15} /> Consultar</button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}
      {loading && !datos ? (
        <Spinner label="Cargando informe…" />
      ) : datos ? (
        <>
          <div className="stats-grid report-stats">
            <div className="stat-card">
              <TrendingUp size={22} />
              <strong>{formatCurrency(datos.resumen.ventas_totales)}</strong>
              <span>Ventas totales</span>
            </div>
            <div className="stat-card">
              <ShoppingCart size={22} />
              <strong>{datos.resumen.total_pedidos}</strong>
              <span>Pedidos aprobados</span>
            </div>
            <div className="stat-card">
              <Users size={22} />
              <strong>{datos.productos_estrella.length}</strong>
              <span>Productos con ventas</span>
            </div>
          </div>

          <div className="report-grid">
            <div className="card">
              <h2>Ventas por categoría</h2>
              {datos.ventas_por_categoria.length === 0 ? (
                <p className="muted">Sin ventas en el período seleccionado.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Categoría</th><th>Pedidos</th><th>Unidades</th><th>Ventas</th></tr>
                  </thead>
                  <tbody>
                    {datos.ventas_por_categoria.map((fila) => (
                      <tr key={fila.categoria}>
                        <td>{fila.categoria}</td>
                        <td>{fila.pedidos}</td>
                        <td>{fila.unidades}</td>
                        <td><strong>{formatCurrency(fila.ventas)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h2>Productos estrella</h2>
              {datos.productos_estrella.length === 0 ? (
                <p className="muted">Sin ventas en el período seleccionado.</p>
              ) : (
                <ol className="top-list">
                  {datos.productos_estrella.map((producto) => (
                    <li key={producto.nombre}>
                      <div>
                        <strong>{producto.nombre}</strong>
                        <small>{producto.marca} · {producto.unidades} unidades</small>
                      </div>
                      <strong>{formatCurrency(producto.ventas)}</strong>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="card alert-card">
        <h2><AlertTriangle size={18} /> Alertas de inventario bajo</h2>
        {alertas.length === 0 ? (
          <p className="muted">No hay productos con inventario bajo.</p>
        ) : (
          <ul className="alert-list">
            {alertas.map((producto) => (
              <li key={producto.id}>
                <strong>{producto.nombre}</strong>
                <span className="text-danger">{producto.stock} {producto.stock === 1 ? 'unidad' : 'unidades'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
