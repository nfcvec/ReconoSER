import api from "../api";

// Obtener todos los reconocimientos
export const getReconocimientos = async ({
  filters = [],
  orderBy = "fechaCreacion",
  orderDirection = "desc",
  page = 1,
  pageSize = 10,
}) => {
  try {
    const response = await api.get("/Reconocimientos",{
      params: {
        filters: JSON.stringify(filters),
        orderBy,
        orderDirection,
        page,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los reconocimientos:", error.message);
    throw error;
  }
};

// Crear un nuevo reconocimiento
export const createReconocimiento = async (data) => {
  try {
    const response = await api.post("/Reconocimientos", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el reconocimiento:", error.message);
    throw error;
  }
};

// Editar un reconocimiento por ID
export const editReconocimiento = async (id, data) => {
  try {
    const response = await api.put(`/Reconocimientos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al editar el reconocimiento con ID ${id}:`, error.message);
    throw error;
  }
};

// Eliminar un reconocimiento por ID
export const deleteReconocimiento = async (id) => {
  try {
    const response = await api.delete(`/Reconocimientos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el reconocimiento con ID ${id}:`, error.message);
    throw error;
  }
};

export const reviewReconocimiento = async (id, data) => {
  try {
    const response = await api.post(`/Reconocimientos/review/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al revisar el reconocimiento con ID ${id}:`, error.message);
    throw error;
  }
}
