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

// Elimina el parámetro token, ya no es necesario
export const getUserOrganizacion = async (oid = null) => {
  try {
    const response = await api.get(`/Organizaciones/by-user`, {
      params: {
        oid: oid,
      },
    });
    return response.data; // Devuelve los datos de la respuesta
  }
  catch (error) {
    console.error('Error al obtener la organización del usuario:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
}

// Función para crear una nueva organización
export const createOrganizacion = async (data) => {
  try {
    const response = await api.post('/Organizaciones', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear la organización:', error.message);
    throw error;
  }
};

// Función para editar una organización existente
export const updateOrganizacion = async (id, organizacion) => {
  try {
    const response = await api.put(`/Organizaciones/${id}`, organizacion);
    return response.data;
  } catch (error) {
    console.error('Error al editar la organización:', error.message);
    throw error;
  }
};

// Función para eliminar una organización
export const deleteOrganizacion = async (id) => {
  try {
    const response = await api.delete(`/Organizaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la organización:', error.message);
    throw error;
  }
};