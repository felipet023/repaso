import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Wrench } from 'lucide-react';
import * as productsService from '../services/products.service';
import * as workshopService from '../services/workshop.service';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    Promise.all([
      productsService.getProducts({ limit: 8 }),
      workshopService.getWorkshopServices()
    ])
      .then(([productosResult, serviciosResult]) => {
        setProductos(productosResult.data);
        setServicios(serviciosResult.data);
      })
      .catch(() => setAviso('No pudimos cargar el catálogo. Inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">NUEVA TEMPORADA 2026</span>
          <h1>DOMINA<br />EL TERRENO</h1>
          <p>Bicicletas de carretera, montaña y e-bike. Componentes premium y servicio técnico experto.</p>
          <div className="hero-search">
            <Search size={18} />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Busca tu bicicleta, marca o accesorio…"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const params = new URLSearchParams();
                  if (busqueda.trim()) params.append('search', busqueda.trim());
                  window.location.href = `/catalogo?${params.toString()}`;
                }
              }}
            />
          </div>
          <Link to="/catalogo" className="btn-primary btn-lg">
            Ver catálogo <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Categorías</h2>
          <div className="category-chips">
            <Link to="/catalogo" className="category-chip chip-lime">Carretera</Link>
            <Link to="/catalogo" className="category-chip chip-green">Montaña</Link>
            <Link to="/catalogo" className="category-chip chip-amber">E-bike</Link>
            <Link to="/catalogo" className="category-chip chip-blue">Accesorios</Link>
            <Link to="/catalogo" className="category-chip chip-red">Protección</Link>
          </div>
        </div>
      </section>

      {/* Destacados */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Más vendidos</h2>
            <Link to="/catalogo" className="link-arrow">Ver todos <ArrowRight size={15} /></Link>
          </div>
          {aviso && <p className="info-box">{aviso}</p>}
          {loading ? <Spinner label="Cargando productos…" /> : (
            <div className="products-grid">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} onAddToCart={agregarAlCarrito} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Taller */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title"><Wrench size={24} /> Servicio técnico</h2>
            <Link to="/taller/agendar" className="link-arrow">Agendar cita <ArrowRight size={15} /></Link>
          </div>
          <div className="services-grid">
            {servicios.map((servicio) => (
              <div className="service-card" key={servicio.id}>
                <h3>{servicio.nombre}</h3>
                <p>{servicio.descripcion}</p>
                <div className="service-meta">
                  <span>{servicio.duracion_minutos} min</span>
                  <span className="price">desde {formatCurrency(servicio.precio_desde)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros (resumen) */}
      <section className="section">
        <div className="section-inner about-preview">
          <div>
            <h2 className="section-title">Nacidos para rodar</h2>
            <p>
              TUKI BIKES nació en el garaje de un grupo de ciclistas apasionados. Hoy distribuimos
              las mejores marcas de ciclismo y nuestro taller certificado mantiene tu bicicleta
              lista para cada temporada.
            </p>
            <Link to="/nosotros" className="btn-secondary">Conócenos</Link>
          </div>
          <div className="stats-grid">
            <div className="stat"><strong>+500</strong><span>clientes activos</span></div>
            <div className="stat"><strong>+1.200</strong><span>bicicletas vendidas</span></div>
            <div className="stat"><strong>4</strong><span>servicios de taller</span></div>
            <div className="stat"><strong>4.7★</strong><span>valoración media</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
