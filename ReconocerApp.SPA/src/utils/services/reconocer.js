import api from "../api";

// Función para enviar la informacion de reconocimiento
export const enviarReconocimiento = async (data) => {
    try {
        const response = await api.post("/Reconocimientos", data);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al enviar el reconocimiento:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Función para obtener los reconocimientos
export const getReconocimientos = async () => {
    try {
        const response = await api.get("/Reconocimientos");
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener los reconocimientos:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}

