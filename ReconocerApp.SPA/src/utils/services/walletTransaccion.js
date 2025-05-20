import api from "../api";

// Función para obtener el balance de la billetera con filtros
export const getWalletTransaction = async (filters = null) => {
    try {
        let url = "/WalletTransacciones";
        if (filters) {
            url += `?filters=${encodeURIComponent(JSON.stringify(filters))}`;
        }
        const response = await api.get(url);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener el balance de la billetera:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}

//Función para crear una transacción
export const createWalletTransaction = async (data) => {
    try {
        const response = await api.post("/WalletTransacciones", data, {
            headers: {
                "Content-Type": "application/json", // Asegúrate de que el encabezado sea correcto
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear la transacción de la billetera:", error.message);
        throw error;
    }
}