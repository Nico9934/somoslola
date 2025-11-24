import api from './axios';

export const dashboardService = {
    async getSummary() {
        const { data } = await api.get('/dashboard/summary');
        return data;
    },

    async getTopProducts() {
        const { data } = await api.get('/dashboard/top-products');
        return data;
    },

    async getRecentOrders() {
        const { data } = await api.get('/dashboard/recent-orders');
        return data;
    },
};
