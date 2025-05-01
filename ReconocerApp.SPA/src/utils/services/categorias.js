import api from "../api";

// Funcion para obtener la lista de categorias
export const getCategorias = async () => {
    try {
        const response = await api.get("/Categoria");
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener las categorias:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Funcion para agregar una nueva categoria
export const createCategoria = async (categoria) => {
    try {
        const response = await api.post("/Categoria", categoria);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al agregar la categoria:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Funcion para editar una categoria existente
export const editCategoria = async (id, categoria) => {
    try {
        const response = await api.put(`/Categoria/${id}`, categoria);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al editar la categoria:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Funcion para eliminar una categoria
export const deleteCategoria = async (id) => {
    try {
        const response = await api.delete(`/Categoria/${id}`);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al eliminar la categoria:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};
