import { API_URL } from '../config/env';
import { getToken } from '../utils/storage';
import { api } from './api';

function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, value);
  });
  return query.toString();
}

export function getUsers(search = '') {
  return api(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
}

export function changeRole(id, rol) {
  return api(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ rol }) });
}

export function changeStatus(id, activo) {
  return api(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ activo }) });
}

export function getDashboard(params = {}) {
  const qs = queryString(params);
  return api(`/admin/dashboard${qs ? `?${qs}` : ''}`);
}

export function getReports(params = {}) {
  const qs = queryString(params);
  return api(`/admin/reports${qs ? `?${qs}` : ''}`);
}

export async function exportReport(params = {}, formato = 'excel') {
  const qs = queryString({ ...params, formato });
  const token = getToken();
  const response = await fetch(`${API_URL}/admin/reports/export?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Error al exportar el informe');
  }
  return response.blob();
}
