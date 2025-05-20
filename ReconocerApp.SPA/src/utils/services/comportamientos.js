import api from '../api';

// Función para obtener todos los comportamientos (get)
export const getComportamientos = async ({
  filters = [],
  orderBy = '',
  orderDirection = '',
  page = 1,
  pageSize = 200,
}) => {
  try {
    const response = await api.get('/Comportamientos', {
      params: {
        filters: JSON.stringify(filters),
        orderBy,
        orderDirection,
        page,
        pageSize,
      },
    });
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error('Error al obtener los comportamientos:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Crear un comportamiento
export const createComportamiento = async (data) => {
  try {
    const response = await api.post('/Comportamientos', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el comportamiento:', error.message);
    throw error;
  }
};

// Editar un comportamiento
export const updateComportamiento = async (id, comportamiento) => {
  try {
    const response = await api.put(`/Comportamientos/${id}`, comportamiento);
    return response.data;
  } catch (error) {
    console.error('Error al editar el comportamiento:', error.message);
    throw error;
  }
};

// Eliminar un comportamiento
export const deleteComportamiento = async (id) => {
  try {
    const response = await api.delete(`/Comportamientos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el comportamiento:', error.message);
    throw error;
  }
};
