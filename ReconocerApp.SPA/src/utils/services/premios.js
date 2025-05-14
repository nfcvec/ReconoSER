import api from "../api";

// Función para obtener los premios desde la API
export const getPremios = async () => {
  try {
    const response = await api.get("/MarketplacePremios?page=1&pageSize=100");
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

// funciones de las imagenes 
// Función para subir imágenes a un premio
export const uploadPremioImages = async (premioId, formData) => {
  try {
    const response = await api.post(`/MarketplacePremios/${premioId}/upload-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Especifica que se está enviando un formulario
      },
    });
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al subir imágenes para el premio con ID ${premioId}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
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
