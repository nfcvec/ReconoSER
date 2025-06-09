import api from "../api";
// Funcion para traer los certificados
export const getCertificados = async ({
    filters,
    page = 1,
    pageSize = 100,
    orderBy = "fechaCreacion",
    orderDirection = "desc"
}) => {
    try {
        const response = await api.get("/Reconocimientos", {
            params: {
                filters: JSON.stringify(filters),
                page,
                pageSize,
                orderBy,
                orderDirection
            }
        }
        );
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener los certificados:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

export const getCertificadoById = async (id) => {
    try {
        const response = await api.get(`/Reconocimientos/${id}`);
        return response.data; // Devuelve los datos del certificado
    } catch (error) {
        console.error("Error al obtener el certificado:", error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
}

// Funcion para crear un certificado 
export const solicitarReconocimiento = async (certificado) => {
    try {
        console.log("Iniciando solicitud de reconocimiento...");
        const response = await api.post("/Reconocimientos", certificado);
        const reconocimientoId = response.data.reconocimientoId;
        console.log(`Reconocimiento creado con ID: ${reconocimientoId}`);

        const responses = await Promise.all(
            certificado.comportamientos.map((comportamiento) => {
                console.log(`Creando reconocimiento-comportamiento para comportamientoId: ${comportamiento.comportamientoId}`);
                return api.post("/ReconocimientoComportamientos", {
                    reconocimientoId,
                    comportamientoId: comportamiento.comportamientoId
                });
            })
        );

        const allSuccess = responses.every((res) => res.status === 200);
        if (allSuccess) {
            console.log("Todos los reconocimientos-comportamientos fueron creados exitosamente.");
        } else {
            console.error("Error al crear algunos reconocimientos-comportamientos.");
            const createdReconocimientos = responses
                .filter((res) => res.status === 200)
                .map((res) => res.data);

            console.log("Eliminando reconocimientos-comportamientos creados...");
            await Promise.all(
                createdReconocimientos.map((reconocimiento) =>
                    api.delete(`/ReconocimientoComportamientos/${reconocimiento.id}`)
                )
            );
            console.log("Reconocimientos-comportamientos eliminados exitosamente.");

            console.log("Eliminando reconocimiento creado...");
            await api.delete(`/Reconocimientos/${reconocimientoId}`);
            console.log("Reconocimiento eliminado exitosamente.");

            throw new Error("Error al crear algunos reconocimientos-comportamientos.");
        }

        console.log("Solicitud de reconocimiento completada exitosamente.");
        return response.data;
    } catch (error) {
        console.error("Error en el proceso de solicitud de reconocimiento:", error.message);
        throw error;
    }
};