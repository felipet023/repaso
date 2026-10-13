import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import * as productsService from '../services/products.service';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorBox from '../components/ErrorBox';
import { formatCurrency, precioConDescuento, urlImagen } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    setLoading(true);
    productsService
      .getProduct(id)
      .then((res) => {
        setProducto(res.data);
        setCantidad(1);
        setError('');
        return productsService.getProducts({ categoria: res.data.categoria.id, limit: 4 });
      })
      .then((res) => {
        setRelacionados(res.data.filter((p) => p.id !== Number(id)));
      })
      .catch((err) => {
        setError(err.message);
        setProducto(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function agregarAlCarrito() {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem(producto.id, cantidad);
      setAviso(`${cantidad} × "${producto.nombre}" agregado al carrito`);
    } catch (err) {
      setAviso(err.message);
    }
  }

  if (loading) return <main className="page"><Spinner label="Cargando producto…" /></main>;
  if (error || !producto) {
    return (
      <main className="page">
        <ErrorBox message={error || 'Producto no encontrado'} />
        <EmptyState title="Producto no disponible" message="Puede que esté agotado o inactivo." />
        <Link to="/catalogo" className="btn-primary">Volver al catálogo</Link>
      </main>
    );
  }

  const imagen = urlImagen(producto.imagen);
  const precioFinal = precioConDescuento(producto.precio, producto.descuento);
  const agotado = producto.stock <= 0;

  return (
    <main className="page detail-page">
      <nav className="breadcrumb">
        <Link to="/catalogo">Catálogo</Link> <span>/</span> <span>{producto.categoria.nombre}</span> <span>/</span> <strong>{producto.nombre}</strong>
      </nav>

      {aviso && <p className="info-box">{aviso}</p>}

      <div className="detail-layout">
        <div className="detail-image">
          {imagen ? <img src={imagen} alt={producto.nombre} /> : <span className="product-no-image">Sin imagen</span>}
          {producto.descuento > 0 && <span className="badge-discount">-{producto.descuento}%</span>}
        </div>

        <div className="detail-info">
          <span className="product-brand">{producto.marca.nombre}</span>
          <h1>{producto.nombre}</h1>
          <span className="product-category">{producto.categoria.nombre}</span>

          <div className="product-rating">
            <Star size={16} fill="currentColor" />
            {Number(producto.rating).toFixed(1)} <span className="muted">· {producto.ventas} vendidos</span>
          </div>

          <div className="detail-price">
            {producto.descuento > 0 && <span className="price-old">{formatCurrency(producto.precio)}</span>}
            <span className="price price-lg">{formatCurrency(precioFinal)}</span>
          </div>

          <p className="detail-stock">
            {agotado ? (
              <span className="text-danger">Agotado</span>
            ) : (
              <span className="text-success">{producto.stock} unidades disponibles</span>
            )}
          </p>

          <p className="detail-description">{producto.descripcion || 'Sin descripción disponible.'}</p>

          <div className="detail-actions">
            <div className="qty-selector">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Disminuir cantidad"><Minus size={16} /></button>
              <span>{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))} aria-label="Aumentar cantidad"><Plus size={16} /></button>
            </div>
            <button type="button" className="btn-primary btn-lg" disabled={agotado} onClick={agregarAlCarrito}>
              <ShoppingCart size={18} /> Agregar al carrito
            </button>
          </div>
          <p className="muted">Total: <strong>{formatCurrency(precioFinal * cantidad)}</strong></p>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="section">
          <h2 className="section-title">También te puede interesar</h2>
          <div className="products-grid">
            {relacionados.map((rel) => (
              <ProductCard key={rel.id} producto={rel} onAddToCart={(p) => agregarAlCarrito()} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
