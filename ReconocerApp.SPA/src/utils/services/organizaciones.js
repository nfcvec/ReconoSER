import api from '../api';

// Función para obtener todas las organizaciones
export const getOrganizaciones = async () => {
  try {
    const response = await api.get('/Organizaciones');
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error('Error al obtener las organizaciones:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};