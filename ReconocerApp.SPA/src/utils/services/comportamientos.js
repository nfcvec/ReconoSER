import api from '../api';

// Función para obtener todos los comportamientos (get)
export const getComportamientos = async () => {
  try {
    const response = await api.get('/Comportamientos');
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error('Error al obtener los comportamientos:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};
