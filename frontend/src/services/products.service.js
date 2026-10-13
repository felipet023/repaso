import { api } from './api';

function toFormData(data) {
  const formData = new FormData();
  formData.append('nombre', data.nombre || '');
  if (data.descripcion != null) formData.append('descripcion', data.descripcion);
  formData.append('id_marca', data.id_marca ?? data.marca?.id ?? '');
  formData.append('id_categoria', data.id_categoria ?? data.categoria?.id ?? '');
  formData.append('precio', data.precio ?? '');
  formData.append('descuento', data.descuento ?? 0);
  formData.append('stock', data.stock ?? 0);
  if (data.imagenFile) formData.append('imagen', data.imagenFile);
  return formData;
}

export function getProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, value);
  });
  const qs = query.toString();
  return api(`/products${qs ? `?${qs}` : ''}`);
}

export function getProduct(id) {
  return api(`/products/${id}`);
}

export function createProduct(data) {
  return api('/products', { method: 'POST', body: toFormData(data) });
}

export function updateProduct(id, data) {
  return api(`/products/${id}`, { method: 'PUT', body: toFormData(data) });
}

export function patchProductStatus(id, activo) {
  return api(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ activo }) });
}
