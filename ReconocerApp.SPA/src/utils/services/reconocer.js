import api from "../api";

// Create new recognition
export const createRecognition = async (data) => {
    try {
        const response = await api.post("/Reconocimientos", data);
        return response.data;
    } catch (error) {
        console.error("Error creating recognition:", error.message);
        throw error;
    }
};

// Get all Reconocimientos
export const fetchRecognitions = async () => {
    try {
        const response = await api.get("/Reconocimientos");
        return response.data;
    } catch (error) {
        console.error("Error fetching recognitions:", error.message);
        throw error;
    }
};

// Update recognition by ID
export const updateRecognition = async (id, data) => {
    try {
        const response = await api.put(`/Reconocimientos/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating recognition:", error.message);
        throw error;
    }
};

// Delete recognition by ID
export const deleteRecognition = async (id) => {
    try {
        const response = await api.delete(`/Reconocimientos/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting recognition:", error.message);
        throw error;
    }
};
