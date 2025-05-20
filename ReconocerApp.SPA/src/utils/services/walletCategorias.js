import api from "../api";

// Función para obtener la lista de WalletCategorias
export const getWalletCategorias = async () => {
    try {
        const response = await api.get("/WalletCategorias");
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener las WalletCategorias:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};
