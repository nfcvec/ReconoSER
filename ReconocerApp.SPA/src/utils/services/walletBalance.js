import api from "../api";

// Función para obtener el balance de la billetera
export const getWalletBalance = async () => {
    try {
        const response = await api.get("/WalletSaldos");
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener el balance de la billetera:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}

//Funcion para obtener el balance de la billetera por id
export const getWalletBalanceById = async (id) => {
    try {
        const response = await api.get(`/WalletSaldos/by-id/${id}`);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener el balance de la billetera:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}
// Función para obtener el balance de la billetera por id de usuario
export const getWalletBalanceByUserId = async (id) => {
    try {
        const response = await api.get(`/WalletSaldos/by-colaborador-id/${id}`);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener el balance de la billetera:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}

