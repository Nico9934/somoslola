import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await ordersService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
        PENDING: 'Pendiente',
        PAID: 'Pagado',
        SHIPPED: 'Enviado',
        COMPLETED: 'Completado',
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
            <div className="max-w-7xl mx-auto px-4 py-8">
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
                                                {item.productName} ({item.variantSku}) x{item.quantity}
                                            </span>
                                            <span>${(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span className="text-secondary">${order.total.toLocaleString()}</span>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
                                    >
                                        Ver detalles
                                    </button>

                                    {order.paymentMethod === 'TRANSFER' && order.status === 'PENDING' && !order.paymentProof && (
                                        <button
                                            onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                            className="flex-1 px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition"
                                        >
                                            📄 Subir comprobante
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
