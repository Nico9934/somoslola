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

    async getMyOrders() {
        const { data } = await api.get('/orders/my-orders');
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

    async uploadPaymentProof(orderId, paymentProof) {
        const { data } = await api.post(`/orders/${orderId}/payment-proof`, { paymentProof });
        return data;
    },
};

