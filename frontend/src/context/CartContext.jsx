import { createContext, useEffect, useMemo, useState } from 'react';
import * as cartService from '../services/cart.service';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const count = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);

  // El carrito siempre vive en el backend asociado al usuario autenticado:
  // se recupera automáticamente al iniciar sesión.
  const refresh = useMemo(() => {
    return async () => {
      if (!isAuthenticated) {
        setItems([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const result = await cartService.getCart();
        setItems(result.items);
        setTotal(result.total);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(idProducto, cantidad = 1) {
    try {
      const result = await cartService.addItem(idProducto, cantidad);
      setItems(result.items);
      setTotal(result.total);
      setError('');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateItem(idProducto, cantidad) {
    try {
      const result = await cartService.updateItem(idProducto, cantidad);
      setItems(result.items);
      setTotal(result.total);
      setError('');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function removeItem(idProducto) {
    try {
      const result = await cartService.removeItem(idProducto);
      setItems(result.items);
      setTotal(result.total);
      setError('');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = useMemo(
    () => ({ items, total, count, loading, error, refresh, addItem, updateItem, removeItem }),
    [items, total, count, loading, error, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
