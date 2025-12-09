import api from './axios';

export const stockNotificationsService = {
    // Crear una solicitud de notificación (público)
    create: async (data) => {
        const response = await api.post('/stock-notifications', data);
        return response.data;
    },

    // Obtener todas las notificaciones (admin)
    getAll: async (params = {}) => {
        const response = await api.get('/stock-notifications', { params });
        return response.data;
    },

    // Actualizar estado de una notificación (admin)
    update: async (id, data) => {
        const response = await api.patch(`/stock-notifications/${id}`, data);
        return response.data;
    },

    // Eliminar notificación (admin)
    delete: async (id) => {
        const response = await api.delete(`/stock-notifications/${id}`);
        return response.data;
    },

    // Obtener estadísticas (admin)
    getStats: async () => {
        const response = await api.get('/stock-notifications/stats');
        return response.data;
    }
};
