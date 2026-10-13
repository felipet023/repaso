import { api } from './api';

export function register(data) {
  return api('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export function login(data) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export function forgotPassword(email) {
  return api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export function resetPassword(data) {
  return api('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
}

export function me() {
  return api('/auth/me');
}
