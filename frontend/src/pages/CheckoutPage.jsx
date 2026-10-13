import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import * as ordersService from '../services/orders.service';
import ErrorBox from '../components/ErrorBox';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const METODOS_PAGO = [
  { value: 'tarjeta', label: 'Tarjeta de crédito / débito (simulada)' },
  { value: 'transferencia', label: 'Transferencia bancaria (simulada)' },
  { value: 'efectivo', label: 'Efectivo contra entrega (simulado)' }
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    direccion: '',
    ciudad: '',
    telefono: '',
    metodo: 'tarjeta',
    forzarRechazo: false
  });
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    ordersService
      .previewCart()
      .then((res) => setResumen(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    if (form.direccion.trim().length < 5) e.direccion = 'La dirección debe tener al menos 5 caracteres';
    if (!form.ciudad.trim()) e.ciudad = 'La ciudad es obligatoria';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!validar()) return;
    setProcesando(true);
    try {
      // 1. Crear el pedido (estado pendiente)
      const pedidoRes = await ordersService.createOrder(`${form.direccion}, ${form.ciudad}`);
      const pedido = pedidoRes.data;

      // 2. Simular el pago
      const pago = await ordersService.simulatePayment(pedido.id_pedido, form.metodo, form.forzarRechazo);

      if (pago.aprobado) {
        await refresh();
        navigate(`/pedido/${pedido.id_pedido}/confirmacion`, { replace: true });
      } else {
        setError(`Pago rechazado (simulado). Referencia: ${pago.referencia}. Tu pedido quedó pendiente: inténtalo de nuevo.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (loading) return <main className="page"><Spinner label="Preparando el checkout…" /></main>;
  if (error && !resumen) {
    return (
      <main className="page">
        <ErrorBox message={error} />
        <Link to="/carrito" className="btn-primary">Volver al carrito</Link>
      </main>
    );
  }
  if (!resumen || resumen.items.length === 0) {
    return (
      <main className="page">
        <EmptyState title="Tu carrito está vacío" message="Agrega productos antes de pagar." />
        <Link to="/catalogo" className="btn-primary">Ir al catálogo</Link>
      </main>
    );
  }

  return (
    <main className="page checkout-page">
      <header className="page-header">
        <h1>Checkout</h1>
        <p className="muted"><Lock size={13} /> Pago 100% simulado — no se almacenan datos reales de tarjetas.</p>
      </header>

      {error && <ErrorBox message={error} />}

      <div className="checkout-layout">
        <form onSubmit={submit} className="card form-grid" noValidate>
          <h2>Datos de la cuenta</h2>
          <div className="form-row">
            <div className="field">
              <label htmlFor="nombre">Nombre *</label>
              <input id="nombre" name="nombre" value={form.nombre} onChange={change} />
              {errores.nombre && <span className="field-error">{errores.nombre}</span>}
            </div>
            <div className="field">
              <label htmlFor="email">Correo *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={change} />
              {errores.email && <span className="field-error">{errores.email}</span>}
            </div>
          </div>

          <h2>Dirección de envío</h2>
          <div className="field">
            <label htmlFor="direccion">Dirección *</label>
            <input id="direccion" name="direccion" placeholder="Calle, carrera, número…" value={form.direccion} onChange={change} />
            {errores.direccion && <span className="field-error">{errores.direccion}</span>}
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="ciudad">Ciudad *</label>
              <input id="ciudad" name="ciudad" value={form.ciudad} onChange={change} />
              {errores.ciudad && <span className="field-error">{errores.ciudad}</span>}
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono *</label>
              <input id="telefono" name="telefono" value={form.telefono} onChange={change} />
              {errores.telefono && <span className="field-error">{errores.telefono}</span>}
            </div>
          </div>

          <h2>Método de pago</h2>
          <div className="field">
            <select id="metodo" name="metodo" value={form.metodo} onChange={change}>
              {METODOS_PAGO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <label className="filter-check">
            <input type="checkbox" name="forzarRechazo" checked={form.forzarRechazo} onChange={change} />
            Simular pago rechazado (para pruebas)
          </label>

          <div className="actions">
            <button type="submit" className="btn-primary btn-lg" disabled={procesando}>
              <CreditCard size={18} /> {procesando ? 'Procesando…' : `Pagar ${formatCurrency(resumen.total)}`}
            </button>
            <Link to="/carrito" className="btn-secondary">Volver al carrito</Link>
          </div>
        </form>

        <aside className="cart-summary card">
          <h2>Resumen del pedido</h2>
          <div className="checkout-items">
            {resumen.items.map((item) => (
              <div className="checkout-item" key={item.id_producto}>
                <span>{item.cantidad} × {item.nombre}</span>
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatCurrency(resumen.total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
