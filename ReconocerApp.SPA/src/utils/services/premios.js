import api from "../api";

// Función para obtener los premios desde la API
export const getPremios = async ({
  filters = [],
  orderBy = "",
  orderDirection = "asc",
  page = 1,
  pageSize = 100,
} = {}) => {
  try {
    const response = await api.get("/MarketplacePremios",
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
    return response.data; // Devuelve los datos de los premios
  } catch (error) {
    console.error("Error al obtener los premios:", error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para obtener un premio específico por ID
export const getPremioById = async (id) => {
  try {
    const response = await api.get(`/MarketplacePremios/detalle/${id}`);
    return response.data; // Devuelve los datos del premio
  } catch (error) {
    console.error(`Error al obtener el premio con ID ${id}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para crear un premio
export const createPremio = async (data) => {
  try {
    const response = await api.post(`/MarketplacePremios`, data);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al crear el premio con ID ${id}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para editar un premio
export const editPremio = async (id, data) => {
  try {
    const response = await api.put(`/MarketplacePremios/${id}`, data);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al editar el premio con ID ${id}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para eliminar un premio
export const deletePremio = async (id) => {
  try {
    const response = await api.delete(`/MarketplacePremios/${id}`);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al eliminar el premio con ID ${id}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Funciones de las imagenes 
// Función para subir imágenes a un premio
export const uploadPremioImages = async (premioId, formData) => {
  try {
    // Enviar el ID y el archivo en el FormData
    const response = await api.post(
      `/MarketplacePremios/${premioId}/upload-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Error al subir imágenes para el premio con ID ${premioId}:`, error.message);
    throw error;
  }
};

// Función para obtener las imágenes de un premio
export const getPremioImages = async (premioId) => {
  try {
    const response = await api.get(`/MarketplacePremios/${premioId}/images`);
    return response.data; // Devuelve los datos de las imágenes
  } catch (error) {
    console.error(`Error al obtener las imágenes del premio con ID ${premioId}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};

// Función para eliminar una imagen específica de un premio
export const deletePremioImage = async (premioId, imageName) => {
  try {
    const response = await api.delete(`/MarketplacePremios/${premioId}/images/${imageName}`);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al eliminar la imagen ${imageName} del premio con ID ${premioId}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};
