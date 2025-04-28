import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL base de la API
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