import api from "../api";

// Función para obtener los premios desde la API
export const getPremios = async () => {
  try {
    const response = await api.get("/MarketplacePremios");
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

// Función para canjear un premio
export const canjearPremio = async (id, data) => {
  try {
    const response = await api.post(`/MarketplacePremios/${id}/canjear`, data);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error(`Error al canjear el premio con ID ${id}:`, error.message);
    throw error; // Lanza el error para manejarlo en el componente
  }
};