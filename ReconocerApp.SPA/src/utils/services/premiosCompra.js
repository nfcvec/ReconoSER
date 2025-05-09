import api from "../api";

// Funcion para obtener todas las compras de premios
export const getPremiosCompras = async () => {
    try {
        console.log("Llamando a getPremiosCompras..."); // Log para verificar que se llama la función
        const response = await api.get("/MarketplaceCompras");
        console.log("Respuesta de getPremiosCompras:", response.data); // Log para verificar los datos obtenidos
        return response.data;
    } catch (error) {
        console.error("Error al obtener las compras de premios:", error.message);
        throw error;
    }
}

// Funcion para obtener una compra de premio por ID
export const getPremioCompraById = async (id) => {
    try {
        const response = await api.get(`/MarketplaceCompras/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
}

// Funcion para crear una compra de premio
export const createPremioCompra = async (data) => {
    try {
        const response = await api.post("/MarketplaceCompras", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear la compra de premio:", error.message);
        throw error;
    }
}

// Funcion para editar una compra de premio por ID
export const editPremioCompra = async (id, data) => {
    try {
        const response = await api.put(`/MarketplaceCompras/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al editar la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
}   

// Funcion para eliminar una compra de premio por ID
export const deletePremioCompra = async (id) => {
    try {
        const response = await api.delete(`/MarketplaceCompras/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
}