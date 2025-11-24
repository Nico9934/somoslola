import { useState, useEffect } from 'react';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await ordersService.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
        PENDING: 'Pendiente',
        CONFIRMED: 'Confirmado',
        SHIPPED: 'Enviado',
        DELIVERED: 'Entregado',
        CANCELLED: 'Cancelado',
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-primary mb-6">Mis Pedidos</h1>

            {orders.length === 0 ? (
                <Card>
                    <p className="text-center text-muted">No tienes pedidos aún</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-primary">
                                        Pedido #{order.id}
                                    </h3>
                                    <p className="text-sm text-muted">
                                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                                    {statusLabels[order.status]}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-muted">
                                            {item.variant?.product?.name || 'Producto'} ({item.variant?.sku}) x{item.quantity}
                                        </span>
                                        <span>${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Total:</span>
                                <span className="text-secondary">${order.total.toLocaleString()}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
}
