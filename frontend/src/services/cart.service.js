import { api } from './api';

export function getCart() {
  return api('/cart');
}

export function addItem(idProducto, cantidad = 1) {
  return api('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ id_producto: idProducto, cantidad })
  });
}

export function updateItem(idProducto, cantidad) {
  return api(`/cart/items/${idProducto}`, {
    method: 'PATCH',
    body: JSON.stringify({ cantidad })
  });
}

export function removeItem(idProducto) {
  return api(`/cart/items/${idProducto}`, { method: 'DELETE' });
}
