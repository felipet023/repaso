import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import * as ordersService from '../services/orders.service';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorBox from '../components/ErrorBox';
import { formatCurrency, formatFecha } from '../utils/format';

const ESTILOS = {
  aprobado: 'badge-success',
  pendiente: 'badge-pending',
  rechazado: 'badge-danger'
};

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersService
      .getOrders()
      .then((res) => setPedidos(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Mis pedidos</h1>
        <p className="muted">Historial de tus compras en TUKI BIKES.</p>
      </header>

      {error && <ErrorBox message={error} />}
      {loading ? (
        <Spinner label="Cargando pedidos…" />
      ) : pedidos.length === 0 ? (
        <EmptyState title="Aún no tienes pedidos" message="Cuando compres, tus pedidos aparecerán aquí." />
      ) : (
        <div className="orders-list">
          {pedidos.map((pedido) => (
            <Link to={`/pedido/${pedido.id_pedido}/confirmacion`} className="order-card card" key={pedido.id_pedido}>
              <div className="order-head">
                <span className="order-number"><Receipt size={16} /> {pedido.numero_pedido}</span>
                <span className={`badge ${ESTILOS[pedido.estado] || 'badge-pending'}`}>{pedido.estado}</span>
              </div>
              <p className="muted">{formatFecha(pedido.created_at)} · {pedido.cantidad_items} {pedido.cantidad_items === 1 ? 'producto' : 'productos'}</p>
              <div className="order-total">
                <span>Total</span>
                <strong>{formatCurrency(pedido.total)}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
