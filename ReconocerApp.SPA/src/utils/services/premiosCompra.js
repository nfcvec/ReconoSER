import api from "../api";

// Funcion para obtener todas las compras de premios
export const getPremiosCompras = async ({
    filters = {},
    orderBy = "compraId",
    orderDirection = "desc",
    page = 1,
    pageSize = 100,
}) => {
    try {
        console.log("Llamando a getPremiosCompras...");
        const response = await api.get("/MarketplaceCompras", {
            params: {
                filters: JSON.stringify(filters),
                orderBy,
                orderDirection,
                page,
                pageSize,
            },
        });
        console.log("Respuesta de getPremiosCompras:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las compras de premios:", error.message);
        throw error;
    }
};

// Funcion para obtener una compra de premio por ID
export const getPremioCompraById = async (id) => {
    try {
        const response = await api.get(`/MarketplaceCompras/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
};

// Funcion para crear una compra de premio
export const createPremioCompra = async (data) => {
    try {
        const response = await api.post("/MarketplaceCompras", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear la compra de premio:", error.message);
        throw error;
    }
};

// Funcion para editar una compra de premio por ID
export const editPremioCompra = async (id, data) => {
    try {
        const response = await api.put(`/MarketplaceCompras/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al editar la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
};

// Funcion para eliminar una compra de premio por ID
export const deletePremioCompra = async (id) => {
    try {
        const response = await api.delete(`/MarketplaceCompras/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
};

// Funcion para revisar una compra de premio por ID
export const revisarPremioCompra = async (id, aprobar) => {
    try {
        console.log(`Revisando compra con ID ${id}, aprobar: ${aprobar}`);
        const response = await api.post(`/MarketplaceCompras/review/${id}`, aprobar);
        console.log("Respuesta de revisarPremioCompra:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error al revisar la compra de premio con ID ${id}:`, error.message);
        throw error;
    }
};
