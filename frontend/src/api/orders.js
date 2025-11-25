import api from './axios';

export const ordersService = {
    async calculateShipping(postalCode) {
        return await api.post('/orders/calculate-shipping', { postalCode });
    },

    async createOrder(orderData) {
        return await api.post('/orders/checkout', orderData);
    },

    async getAll() {
        const { data } = await api.get('/orders');
        return data;
    },

    async getOrderById(id) {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },

    async updateStatus(id, status) {
        const { data } = await api.put(`/orders/${id}/status`, { status });
        return data;
    },
};

