import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem('syra.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function fetchServices() {
  const { data } = await api.get('/servicos');
  return Array.isArray(data) ? data : [];
}

export async function fetchSchedules() {
  const { data } = await api.get('/horarios');
  return Array.isArray(data) ? data : [];
}

export async function fetchAppointmentsByPeriod(inicio, fim) {
  const { data } = await api.get('/agendamentos/periodo', {
    params: { inicio, fim },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchUsersByRole(role) {
  const { data } = await api.get(`/usuarios/role/${encodeURIComponent(role)}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchUserByEmail(email) {
  const { data } = await api.get(`/usuarios/email/${encodeURIComponent(email)}`);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post('/usuarios/register', payload);
  return data;
}

export async function loginDevelopmentUser(payload) {
  const { data } = await api.post('/usuarios/teste', payload);
  return data;
}

export async function updateUserPhone(userId, numero) {
  const { data } = await api.put(`/usuarios/${userId}/telefone`, { numero });
  return data;
}

export async function findOrCreateUser(payload) {
  try {
    const existing = await fetchUserByEmail(payload.email);
    if (existing?.id) {
      return existing;
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }
  }

  return registerUser(payload);
}

export async function createAppointment(payload) {
  const { data } = await api.post('/agendamentos', payload);
  return data;
}

export async function fetchAllAppointments() {
  const { data } = await api.get('/agendamentos');
  return Array.isArray(data) ? data : [];
}

export async function fetchAppointmentsByClient(usuarioId) {
  const { data } = await api.get(`/agendamentos/cliente/${usuarioId}`);
  return Array.isArray(data) ? data : [];
}

export async function cancelAppointment(id, observacoes) {
  const { data } = await api.patch(`/agendamentos/${id}/cancelar`, observacoes ? { observacoes } : {});
  return data;
}

export async function confirmAppointment(id) {
  const { data } = await api.patch(`/agendamentos/${id}/confirmar`);
  return data;
}

export async function saveSchedule(payload) {
  if (payload?.id) {
    const { data } = await api.put(`/horarios/${payload.id}`, payload);
    return data;
  }

  const { data } = await api.post('/horarios', payload);
  return data;
}

export async function createService(payload) {
  const { data } = await api.post('/servicos', payload);
  return data;
}

export async function updateService(id, payload) {
  const { data } = await api.put(`/servicos/${id}`, payload);
  return data;
}

export async function deleteService(id) {
  await api.delete(`/servicos/${id}`);
}

// --- PRODUTOS ---
export async function fetchProducts() {
  const { data } = await api.get('/produtos');
  return Array.isArray(data) ? data : [];
}

export async function createProduct(formData) {
  // O axios lida com o FormData, só precisamos avisar o cabeçalho
  const { data } = await api.post('/produtos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id, formData) {
  const { data } = await api.put(`/produtos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/produtos/${id}`);
}

