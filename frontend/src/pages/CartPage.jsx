import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ErrorBox from '../components/ErrorBox';
import { formatCurrency, urlImagen } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items, total, updateItem, removeItem } = useCart();
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  if (!isAuthenticated) {
    return (
      <main className="page">
        <EmptyState
          title="Inicia sesión para ver tu carrito"
          message="El carrito se guarda en tu cuenta y se recupera en cualquier momento."
        />
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
      </main>
    );
  }

  async function cambiarCantidad(idProducto, cantidad) {
    setError('');
    setAviso('');
    try {
      await updateItem(idProducto, cantidad);
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(idProducto) {
    setError('');
    setAviso('');
    try {
      await removeItem(idProducto);
      setAviso('Producto eliminado del carrito');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page cart-page">
      <header className="page-header">
        <h1>Carrito de compras</h1>
        <p className="muted">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
      </header>

      {error && <ErrorBox message={error} />}
      {aviso && <p className="info-box">{aviso}</p>}

      {items.length === 0 ? (
        <EmptyState title="Tu carrito está vacío" message="Agrega productos desde el catálogo." />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.id_producto}>
                <Link to={`/producto/${item.id_producto}`} className="cart-item-image">
                  {item.imagen ? <img src={urlImagen(item.imagen)} alt={item.nombre} /> : <span className="product-no-image">Sin imagen</span>}
                </Link>
                <div className="cart-item-info">
                  <h3>{item.nombre}</h3>
                  <p className="muted">{item.marca}</p>
                  <p className="cart-item-price">{formatCurrency(item.precioFinal)}</p>
                </div>
                <div className="qty-selector">
                  <button type="button" onClick={() => cambiarCantidad(item.id_producto, Math.max(1, item.cantidad - 1))} aria-label="Disminuir cantidad" disabled={item.cantidad <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{item.cantidad}</span>
                  <button type="button" onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)} aria-label="Aumentar cantidad">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="cart-item-subtotal">{formatCurrency(item.subtotal)}</div>
                <button type="button" className="icon-btn danger" onClick={() => eliminar(item.id_producto)} aria-label={`Eliminar ${item.nombre}`}>
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary card">
            <h2>Resumen</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <strong className="text-success">Gratis</strong>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <Link to="/checkout" className="btn-primary btn-lg">
              <ShoppingCart size={16} /> Ir al checkout
            </Link>
            <Link to="/catalogo" className="btn-secondary">Seguir comprando</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
