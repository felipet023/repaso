import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productsService from '../../services/products.service';
import ProductForm from '../../components/ProductForm';
import Spinner from '../../components/Spinner';
import ErrorBox from '../../components/ErrorBox';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState({});
  const [filtros, setFiltros] = useState({ categorias: [], marcas: [] });
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productsService.getProducts({ limit: 1 }).then((res) => setFiltros(res.filtros || { categorias: [], marcas: [] })).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsService
      .getProduct(id)
      .then((res) => setInitial(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setError('');
    try {
      if (id) {
        await productsService.updateProduct(id, data);
      } else {
        await productsService.createProduct(data);
      }
      navigate('/admin/productos');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Cargando producto…" />;

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>{id ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>
      {error && <ErrorBox message={error} />}
      <ProductForm
        key={initial.id || 'nuevo'}
        initial={initial}
        filtros={filtros}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/productos')}
        submitting={submitting}
      />
    </div>
  );
}
