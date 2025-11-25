import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);

    useEffect(() => {
        if (!order && orderId) {
            fetchOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { data } = await ordersService.getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error('❌ Error al cargar orden:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Spinner />
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                    <p className="text-gray-600">No se encontró la orden</p>
                    <Button onClick={() => navigate('/products')} className="mt-4">
                        Volver a la tienda
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header de confirmación */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado! 🎉</h1>
                    <p className="text-gray-600">Tu pedido ha sido registrado exitosamente</p>
                    <p className="text-sm text-gray-500 mt-2">Número de orden: <strong>#{order.id}</strong></p>
                </div>

                {/* Información del pedido */}
                <div className="space-y-4">
                    {/* Datos de envío */}
                    <Card>
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <span className="mr-2">📦</span>
                            Datos de Envío
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Nombre:</strong> {order.customerName}</p>
                            <p><strong>Email:</strong> {order.email}</p>
                            <p><strong>Teléfono:</strong> {order.customerPhone}</p>
                            <p><strong>Dirección:</strong> {order.shippingAddress}</p>
                            <p><strong>Ciudad:</strong> {order.shippingCity}, {order.shippingState}</p>
                            <p><strong>Código Postal:</strong> {order.shippingPostalCode}</p>
                        </div>
                    </Card>

                    {/* Método de pago */}
                    <Card>
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <span className="mr-2">💳</span>
                            Método de Pago
                        </h2>
                        <p className="text-sm">
                            {order.paymentMethod === 'CARD' ? (
                                '💳 Tarjeta de Crédito/Débito'
                            ) : (
                                <>🏦 Transferencia Bancaria</>
                            )}
                        </p>

                        {order.paymentMethod === 'TRANSFER' && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">Datos para transferencia:</p>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p><strong>Banco:</strong> Banco Ejemplo</p>
                                    <p><strong>CBU:</strong> 0000003100012345678901</p>
                                    <p><strong>Alias:</strong> SOMOSLOLA.STORE</p>
                                    <p><strong>Titular:</strong> Somos Lola SA</p>
                                    <p className="pt-2">
                                        <strong>Monto a transferir:</strong> ${order.total.toFixed(2)}
                                    </p>
                                </div>
                                <p className="text-xs text-blue-700 mt-3">
                                    📧 Envianos el comprobante a: pagos@somoslola.com
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Productos */}
                    <Card>
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <span className="mr-2">🛍️</span>
                            Productos
                        </h2>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-3 border-b last:border-b-0">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-sm text-gray-600">SKU: {item.variantSku}</p>
                                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                                            <p className="text-sm text-gray-600">
                                                {Object.entries(item.attributes).map(([key, value]) => (
                                                    <span key={key} className="mr-2">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Totales */}
                    <Card>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>${(order.total - order.shippingCost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Envío:</span>
                                <span>${order.shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Acciones */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/products')} variant="outline">
                        Seguir comprando
                    </Button>
                    <Button onClick={() => window.print()}>
                        Imprimir comprobante
                    </Button>
                </div>

                {/* Mensaje adicional */}
                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-700">
                        📧 Hemos enviado un email de confirmación a <strong>{order.email}</strong>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                        Si tienes alguna consulta, contactanos a: soporte@somoslola.com
                    </p>
                </div>
            </div>
        </Layout>
    );
}
