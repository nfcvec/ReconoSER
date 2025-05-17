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

export const getUserOrganizacion = async (token) => {
  try {
    const response = await api.get(`/Organizaciones/by-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Devuelve los datos de la respuesta
  }
  catch (error) {
    console.error('Error al obtener la organización del usuario:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
}