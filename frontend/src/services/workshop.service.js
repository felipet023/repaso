import { api } from './api';

export function getWorkshopServices() {
  return api('/workshop/services');
}

export function createAppointment(data) {
  return api('/workshop/appointments', { method: 'POST', body: JSON.stringify(data) });
}

export function getAppointments() {
  return api('/workshop/appointments');
}
