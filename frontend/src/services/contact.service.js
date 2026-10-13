import { api } from './api';

export function sendMessage(data) {
  return api('/contact', { method: 'POST', body: JSON.stringify(data) });
}
