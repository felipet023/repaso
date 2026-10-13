import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, XCircle } from 'lucide-react';
import * as ordersService from '../services/orders.service';
import Spinner from '../components/Spinner';
import ErrorBox from '../components/ErrorBox';
import { formatCurrency, formatFecha } from '../utils/format';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersService
      .getOrder(id)
      .then((res) => setPedido(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="page"><Spinner label="Cargando tu pedido…" /></main>;
  if (error || !pedido) {
    return (
      <main className="page">
        <ErrorBox message={error || 'Pedido no encontrado'} />
        <Link to="/mis-pedidos" className="btn-primary">Ver mis pedidos</Link>
      </main>
    );
  }

  const aprobado = pedido.estado === 'aprobado';

  return (
    <main className="page narrow-page">
      <div className="card confirmation-card">
        {aprobado ? (
          <CheckCircle size={52} className="success-icon" />
        ) : (
          <XCircle size={52} className="danger-icon" />
        )}
        <h1>{aprobado ? '¡Pedido confirmado!' : 'Pedido rechazado'}</h1>
        <p className="muted">
          {aprobado
            ? 'Gracias por tu compra. Te enviaremos la confirmación a tu correo.'
            : 'El pago fue rechazado (simulado). El pedido no se confirmó y el inventario no cambió.'}
        </p>

        <dl className="pedido-resumen">
          <div><dt>Número de pedido</dt><dd><strong>{pedido.numero_pedido}</strong></dd></div>
          <div><dt>Fecha</dt><dd>{formatFecha(pedido.created_at)}</dd></div>
          <div><dt>Estado</dt><dd><span className={aprobado ? 'badge-success' : 'badge-pending'}>{pedido.estado}</span></dd></div>
          <div><dt>Envío a</dt><dd>{pedido.direccion}</dd></div>
        </dl>

        <div className="confirmation-items">
          <h2>Productos</h2>
          {pedido.items.map((item) => (
            <div className="checkout-item" key={item.id_producto}>
              <span>{item.cantidad} × {item.nombre}</span>
              <strong>{formatCurrency(item.cantidad * Number(item.precio_unitario))}</strong>
            </div>
          ))}
        </div>

        <div className="summary-row summary-total">
          <span>Total pagado</span>
          <strong>{formatCurrency(pedido.total)}</strong>
        </div>

        <div className="actions confirmation-actions">
          <Link to="/mis-pedidos" className="btn-primary"><Package size={16} /> Mis pedidos</Link>
          <Link to="/catalogo" className="btn-secondary">Seguir comprando</Link>
        </div>
      </div>
    </main>
  );
}
