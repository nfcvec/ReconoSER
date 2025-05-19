import axios from 'axios';
import { getAccessToken } from './getAccessToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL base de la API
});

api.interceptors.request.use(async (config) => {
  console.log('[API] Interceptor ejecutado para', config.url);
  try {
    const token = await getAccessToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Token agregado al request');
  } catch (e) {
    // Si no hay usuario activo, no realiza la consulta y notifica
    console.log('[API] No hay usuario activo, la consulta no se realizará');
    return Promise.reject(new Error('No hay usuario activo, la consulta no se realizará'));
  }
  return config;
});

// Función para verificar la conexión con la API
export const checkApiConnection = async () => {
  try {
    const response = await api.get('/'); // Cambia '/' por un endpoint válido si es necesario
    console.log('Conexión exitosa con la API:', response.status, response.data);
  } catch (error) {
    console.error('Error al conectar con la API:', error.message);
  }
};

export default api;