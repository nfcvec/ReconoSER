import api from "../api";
// Funcion para traer los certificados
export const getCertificados = async () => {
    try {
        const response = await api.get("/Reconocimientos");
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener los certificados:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Funcion para crear un certificado 
export const createCertificado = async (certificado) => {
    try {
        const response = await api.post("/Reconocimientos", certificado);
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al crear el certificado:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};