import { api } from './api';

export function previewCart() {
  return api('/orders/preview', { method: 'POST' });
}

export function createOrder(direccion) {
  return api('/orders', { method: 'POST', body: JSON.stringify({ direccion }) });
}

export function getOrders() {
  return api('/orders');
}

export function getOrder(id) {
  return api(`/orders/${id}`);
}

export function simulatePayment(idPedido, metodo, forzarRechazo = false) {
  return api('/payments/simulate', {
    method: 'POST',
    body: JSON.stringify({ id_pedido: idPedido, metodo, forzarRechazo })
  });
}
