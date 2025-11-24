import axios from './axios';

export const attributesService = {
    // Obtener todos los atributos
    getAll: async (includeInactive = false) => {
        const response = await axios.get('/attributes', {
            params: { includeInactive }
        });
        return response.data;
    },

    // Obtener atributo por ID
    getById: async (id) => {
        const response = await axios.get(`/attributes/${id}`);
        return response.data;
    },

    // Crear atributo
    create: async (data) => {
        const response = await axios.post('/attributes', data);
        return response.data;
    },

    // Actualizar atributo
    update: async (id, data) => {
        const response = await axios.put(`/attributes/${id}`, data);
        return response.data;
    },

    // Eliminar atributo
    delete: async (id) => {
        const response = await axios.delete(`/attributes/${id}`);
        return response.data;
    },

    // Agregar valor a atributo
    addValue: async (attributeId, data) => {
        const response = await axios.post(`/attributes/${attributeId}/values`, data);
        return response.data;
    },

    // Actualizar valor de atributo
    updateValue: async (attributeId, valueId, data) => {
        const response = await axios.put(`/attributes/${attributeId}/values/${valueId}`, data);
        return response.data;
    },

    // Eliminar valor de atributo
    deleteValue: async (attributeId, valueId) => {
        const response = await axios.delete(`/attributes/${attributeId}/values/${valueId}`);
        return response.data;
    },
};
