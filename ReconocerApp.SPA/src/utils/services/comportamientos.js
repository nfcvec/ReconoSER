import api from '../api';

// Función para obtener todos los comportamientos (get)
export const getComportamientos = async ({
  filters = [],
  orderBy = '',
  orderDirection = '',
  page = 1,
  pageSize = 100,
}) => {
  try {
    const response = await api.get('/Comportamientos',
      {
        params: {
          filters: JSON.stringify(filters),
          orderBy,
          orderDirection,
          page,
          pageSize,
        },
      }
    );
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error('Error al obtener los comportamientos:', error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};
