import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as productsService from '../services/products.service';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorBox from '../components/ErrorBox';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const DEFAULTS = {
  search: '',
  categoria: '',
  marca: '',
  min: '',
  max: '',
  disponible: false,
  rating: '',
  orden: 'mas_vendidos'
};

export default function CatalogPage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  const [valores, setValores] = useState(() => ({
    ...DEFAULTS,
    search: searchParams.get('search') || '',
    categoria: searchParams.get('categoria') || ''
  }));
  const [filtros, setFiltros] = useState({ categorias: [], marcas: [] });
  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const debounceRef = useRef(null);

  // Carga los metadatos de filtros (categorías y marcas) una sola vez
  useEffect(() => {
    productsService
      .getProducts({ limit: 1 })
      .then((res) => setFiltros(res.filtros || { categorias: [], marcas: [] }))
      .catch(() => {});
  }, []);

  // Consulta con debounce de 300 ms
  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = {};
      Object.entries(valores).forEach(([key, value]) => {
        if (value !== '' && value !== false && value !== undefined && value !== null) params[key] = value;
      });
      productsService
        .getProducts(params)
        .then((res) => {
          setResultado({ data: res.data, total: res.total });
          setError('');
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [valores]);

  const productos = useMemo(() => resultado.data, [resultado]);

  async function agregarAlCarrito(producto) {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem(producto.id);
      setAviso(`"${producto.nombre}" agregado al carrito`);
    } catch (err) {
      setAviso(err.message);
    }
  }

  return (
    <main className="page catalog-page">
      <header className="page-header">
        <h1>Catálogo</h1>
        <p className="muted">Bicicletas, accesorios y protección de las mejores marcas.</p>
      </header>

      {error && <ErrorBox message={error} />}
      {aviso && <p className="info-box">{aviso}</p>}

      <div className="catalog-layout">
        <ProductFilters filtros={filtros} valores={valores} onChange={setValores} resultado={loading ? undefined : resultado.total} />

        <section className="catalog-results">
          {loading ? (
            <Spinner label="Cargando productos…" />
          ) : productos.length === 0 ? (
            <EmptyState
              title="No se encontraron productos"
              message="Prueba a cambiar la búsqueda o limpiar los filtros."
            />
          ) : (
            <div className="products-grid">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} onAddToCart={agregarAlCarrito} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
