import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { formatCurrency, precioConDescuento, urlImagen } from '../utils/format';

export default function ProductCard({ producto, onAddToCart }) {
  const imagen = urlImagen(producto.imagen);
  const precioFinal = precioConDescuento(producto.precio, producto.descuento);
  const agotado = Number(producto.stock) <= 0;

  return (
    <article className="product-card">
      <Link to={`/producto/${producto.id}`} className="product-card-image">
        {imagen ? (
          <img src={imagen} alt={producto.nombre} loading="lazy" />
        ) : (
          <span className="product-no-image">Sin imagen</span>
        )}
        {producto.descuento > 0 && <span className="badge-discount">-{producto.descuento}%</span>}
        {agotado && <span className="badge-soldout">Agotado</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-brand">{producto.marca?.nombre}</span>
        <h3 className="product-name">
          <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        <span className="product-category">{producto.categoria?.nombre}</span>
        <div className="product-rating">
          <Star size={14} fill="currentColor" />
          {Number(producto.rating).toFixed(1)}
          <span className="muted">· {producto.ventas} vendidos</span>
        </div>
        <div className="product-price-row">
          <div className="product-price">
            {producto.descuento > 0 && <span className="price-old">{formatCurrency(producto.precio)}</span>}
            <span className="price">{formatCurrency(precioFinal)}</span>
          </div>
          <button
            type="button"
            className="btn-primary btn-icon"
            disabled={agotado}
            onClick={() => onAddToCart?.(producto)}
            aria-label={`Agregar ${producto.nombre} al carrito`}
            title="Agregar al carrito"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
