import { useState, useEffect } from 'react';
import { ordersService } from '../../api/orders';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function OrdersManagement() {
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

    const handleUpdateStatus = async (id, status) => {
        try {
            await ordersService.updateStatus(id, status);
            loadOrders();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const statuses = [
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'PAID', label: 'Pagado' },
        { value: 'SHIPPED', label: 'Enviado' },
        { value: 'COMPLETED', label: 'Completado' },
        { value: 'CANCELLED', label: 'Cancelado' },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminPageLayout title="Pedidos">
                {orders.length === 0 ? (
                    <Card>
                        <p className="text-center text-muted">No hay pedidos</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-primary">
                                            Pedido #{order.id}
                                        </h3>
                                        <p className="text-sm text-muted">
                                            Cliente: {order.user?.email || order.email || 'Guest'}
                                        </p>
                                        <p className="text-sm text-muted">
                                            Fecha: {new Date(order.createdAt).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-secondary mb-2">
                                            ${order.total.toLocaleString()}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                                            {statuses.find(s => s.value === order.status)?.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mb-4">
                                    <h4 className="font-semibold text-primary mb-2">Información de pago:</h4>
                                    <p className="text-sm text-muted mb-2">
                                        Método: {order.paymentMethod === 'TRANSFER' ? '🏦 Transferencia' : '💳 Tarjeta'}
                                    </p>

                                    {order.paymentMethod === 'TRANSFER' && order.paymentProof && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-primary mb-2">Comprobante de pago:</p>
                                            <a
                                                href={order.paymentProof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block"
                                            >
                                                <img
                                                    src={order.paymentProof}
                                                    alt="Comprobante"
                                                    className="max-w-xs rounded border border-gray-300 hover:border-secondary transition-colors cursor-pointer"
                                                />
                                            </a>
                                            <p className="text-xs text-muted mt-1">
                                                Click en la imagen para ver en tamaño completo
                                            </p>
                                        </div>
                                    )}

                                    {order.paymentMethod === 'TRANSFER' && !order.paymentProof && (
                                        <p className="text-sm text-yellow-600">
                                            ⏳ Esperando comprobante del cliente
                                        </p>
                                    )}
                                </div>

                                <div className="border-t pt-4 mb-4">
                                    <h4 className="font-semibold text-primary mb-2">Productos:</h4>
                                    <div className="space-y-2">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    {item.imageUrl && (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <span>
                                                        {item.productName} ({item.variantSku}) x{item.quantity}
                                                    </span>
                                                </div>
                                                <span className="font-semibold">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {statuses.map((status) => (
                                        <Button
                                            key={status.value}
                                            variant={order.status === status.value ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleUpdateStatus(order.id, status.value)}
                                            disabled={order.status === status.value}
                                        >
                                            {status.label}
                                        </Button>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </AdminPageLayout>
        </AdminLayout>
    );
}
