import { useState, useEffect } from 'react';
import { dashboardService } from '../../api/dashboard';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { text, cards } from '../../styles';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [summaryData, productsData, ordersData] = await Promise.all([
                dashboardService.getSummary(),
                dashboardService.getTopProducts(),
                dashboardService.getRecentOrders(),
            ]);
            setSummary(summaryData);
            setTopProducts(productsData);
            setRecentOrders(ordersData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    <Spinner size="lg" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Dashboard"
                showSearch={false}
                showCreateButton={false}
            >
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-gray-800 to-black text-white shadow-md">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Total Pedidos</h3>
                            <p className="text-3xl font-bold">{summary?.totalOrders || 0}</p>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Total Clientes</h3>
                            <p className="text-3xl font-bold">{summary?.totalCustomers || 0}</p>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Ventas Totales</h3>
                            <p className="text-3xl font-bold">
                                ${(summary?.totalSales || 0).toLocaleString()}
                            </p>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Ticket Promedio</h3>
                            <p className="text-3xl font-bold">
                                ${(summary?.ticketPromedio || 0).toLocaleString()}
                            </p>
                        </Card>
                    </div>

                    {/* Charts/Tables Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card variant="bordered">
                            <h2 className={text.sectionTitle}>Productos Más Vendidos</h2>
                            <div className="space-y-3">
                                {topProducts.length === 0 ? (
                                    <p className={`${text.muted} text-center py-8`}>No hay datos disponibles</p>
                                ) : (
                                    topProducts.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-warm-50 rounded-lg hover:bg-warm-100 transition">
                                            <div className="flex-1">
                                                <p className={text.label}>{item.productName}</p>
                                                <p className={text.muted}>SKU: {item.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`${text.value} text-lg`}>{item.totalSold}</p>
                                                <p className={text.muted}>vendidos</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        <Card variant="bordered">
                            <h2 className={text.sectionTitle}>Últimos Pedidos</h2>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className={`${text.muted} text-center py-8`}>No hay pedidos</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div>
                                                <p className={text.label}>Pedido #{order.id}</p>
                                                <p className={text.muted}>{order.email || 'Guest'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={text.value}>${order.total.toLocaleString()}</p>
                                                <p className={text.muted}>{order.status}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
}
