import { useState, useEffect } from 'react';
import { ordersService } from '../../api/orders';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ChevronDown, ChevronUp, User, MapPin, CreditCard, Package, Image as ImageIcon } from 'lucide-react';
import { text, badges } from '../../styles';

export default function OrdersManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState(new Set());

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

    const toggleExpand = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
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
                        <p className={`${text.muted} text-center`}>No hay pedidos</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const isExpanded = expandedOrders.has(order.id);

                            return (
                                <Card key={order.id} variant="bordered">
                                    {/* Header compacto - siempre visible */}
                                    <div
                                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-lg transition-colors"
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Número de orden */}
                                            <div className="flex-shrink-0">
                                                <p className={`${text.caption} text-gray-500`}>Pedido</p>
                                                <p className={`${text.label} font-bold`}>#{order.id}</p>
                                            </div>

                                            {/* Separador vertical */}
                                            <div className="h-12 w-px bg-gray-200"></div>

                                            {/* Info del cliente */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <p className={`${text.body} font-semibold truncate`}>
                                                        {order.customerName}
                                                    </p>
                                                </div>
                                                <p className={`${text.caption} text-gray-500 truncate`}>
                                                    {order.email}
                                                </p>
                                            </div>

                                            {/* Estado */}
                                            <div className="flex-shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                                                    {statuses.find(s => s.value === order.status)?.label}
                                                </span>
                                            </div>

                                            {/* Total */}
                                            <div className="flex-shrink-0 text-right">
                                                <p className={`${text.caption} text-gray-500`}>Total</p>
                                                <p className={`${text.sectionTitle} text-secondary`}>
                                                    ${order.total.toLocaleString('es-AR')}
                                                </p>
                                            </div>

                                            {/* Icono expandir */}
                                            <div className="flex-shrink-0">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenido expandible */}
                                    {isExpanded && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                                            {/* Grid de información */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Información del cliente */}
                                                <div>
                                                    <h4 className={`${text.label} mb-3 flex items-center gap-2`}>
                                                        <User className="h-4 w-4" />
                                                        Datos del Cliente
                                                    </h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Nombre:</span>
                                                            <span className="font-medium">{order.customerName}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Email:</span>
                                                            <span className="font-medium">{order.email}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Teléfono:</span>
                                                            <span className="font-medium">{order.customerPhone}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Fecha:</span>
                                                            <span className="font-medium">
                                                                {new Date(order.createdAt).toLocaleString('es-AR', {
                                                                    dateStyle: 'short',
                                                                    timeStyle: 'short'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dirección de envío */}
                                                <div>
                                                    <h4 className={`${text.label} mb-3 flex items-center gap-2`}>
                                                        <MapPin className="h-4 w-4" />
                                                        Dirección de Envío
                                                    </h4>
                                                    <div className="space-y-2 text-sm">
                                                        <p className="font-medium">{order.shippingAddress}</p>
                                                        {order.shippingNeighborhood && (
                                                            <p className="text-gray-600">Barrio: {order.shippingNeighborhood}</p>
                                                        )}
                                                        <p className="text-gray-600">
                                                            {order.shippingCity}, {order.shippingState}
                                                        </p>
                                                        <p className="text-gray-600">CP: {order.shippingPostalCode}</p>
                                                        <div className="flex justify-between pt-2 border-t">
                                                            <span className="text-gray-600">Costo de envío:</span>
                                                            <span className="font-semibold text-secondary">
                                                                ${order.shippingCost.toLocaleString('es-AR')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Información de pago */}
                                            <div>
                                                <h4 className={`${text.label} mb-3 flex items-center gap-2`}>
                                                    <CreditCard className="h-4 w-4" />
                                                    Información de Pago
                                                </h4>
                                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Método de pago:</span>
                                                        <span className="font-medium">
                                                            {order.paymentMethod === 'TRANSFER' ? '🏦 Transferencia' : '💳 Tarjeta'}
                                                        </span>
                                                    </div>

                                                    {order.paymentMethod === 'TRANSFER' && (
                                                        <>
                                                            {order.paymentProof ? (
                                                                <div className="mt-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <ImageIcon className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-sm font-medium">Comprobante de pago:</span>
                                                                    </div>
                                                                    <a
                                                                        href={order.paymentProof}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-block"
                                                                    >
                                                                        <img
                                                                            src={order.paymentProof}
                                                                            alt="Comprobante"
                                                                            className="max-w-xs rounded border-2 border-gray-300 hover:border-secondary transition-colors cursor-pointer shadow-sm"
                                                                        />
                                                                    </a>
                                                                    <p className={`${text.caption} mt-2`}>
                                                                        Click para ver en tamaño completo
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded">
                                                                    <span className="text-lg">⏳</span>
                                                                    <span className="text-sm">Esperando comprobante del cliente</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Productos */}
                                            <div>
                                                <h4 className={`${text.label} mb-3 flex items-center gap-2`}>
                                                    <Package className="h-4 w-4" />
                                                    Productos ({order.items?.length || 0})
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.items?.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {item.imageUrl && (
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.productName}
                                                                        className="w-14 h-14 object-cover rounded border border-gray-200"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className={`${text.body} font-medium`}>
                                                                        {item.productName}
                                                                    </p>
                                                                    <p className={text.caption}>
                                                                        SKU: {item.variantSku} · Cantidad: {item.quantity}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`${text.body} font-semibold text-secondary`}>
                                                                ${(item.price * item.quantity).toLocaleString('es-AR')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cambiar estado */}
                                            <div className="pt-4 border-t">
                                                <h4 className={`${text.label} mb-3`}>Cambiar Estado del Pedido</h4>
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
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </AdminPageLayout>
        </AdminLayout>
    );
}
