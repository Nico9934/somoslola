import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { text, badges, layout, buttons } from '../../styles';

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
        PENDING: badges.warning,
        PAID: badges.info,
        SHIPPED: badges.info,
        COMPLETED: badges.success,
        CANCELLED: badges.error,
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
            <div className={layout.container}>
                <h1 className={text.pageTitle}>Mis Pedidos</h1>

                {orders.length === 0 ? (
                    <Card variant="bordered">
                        <p className={`${text.muted} text-center`}>No tienes pedidos aún</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id} variant="bordered">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className={text.label}>
                                            Pedido #{order.id}
                                        </h3>
                                        <p className={text.muted}>
                                            {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                    <span className={statusColors[order.status]}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className={text.muted}>
                                                {item.productName} ({item.variantSku}) x{item.quantity}
                                            </span>
                                            <span>${(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span className={text.value}>${order.total.toLocaleString()}</span>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                        className={`${buttons.primary} flex-1`}
                                    >
                                        Ver detalles
                                    </button>

                                    {order.paymentMethod === 'TRANSFER' && order.status === 'PENDING' && !order.paymentProof && (
                                        <button
                                            onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                            className={`${buttons.secondary} flex-1`}
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
