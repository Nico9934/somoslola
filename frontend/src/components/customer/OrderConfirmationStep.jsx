import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { text } from '../../styles';
import { orderSummary } from '../../styles/components';

export default function OrderConfirmationStep({
    order,
    uploading,
    uploadSuccess,
    fileInputRef,
    onFileUpload
}) {
    const navigate = useNavigate();

    if (!order) return null;

    return (
        <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 w-full"
        >
            {/* Header con icono de éxito */}
            <div className="text-center py-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className="inline-flex mb-4"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h2>
                <p className="text-gray-600">
                    Gracias por tu compra. Número de pedido: <strong className="font-mono">#{order.id}</strong>
                </p>
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Productos */}
                    <Card variant="bordered">
                        <h3 className="text-lg font-semibold mb-4">Productos</h3>
                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
                                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                                            <p className="text-sm text-gray-500">
                                                {Object.entries(item.attributes).map(([key, value]) => (
                                                    <span key={key} className="mr-3">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">Cantidad: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ${((item.price || 0) * (item.quantity || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-gray-500">${(item.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Información de pago */}
                    <Card variant="bordered">
                        <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>

                        {order.paymentMethod === 'TRANSFER' ? (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="font-medium text-gray-900 mb-2">Estado: En espera de pago</p>
                                    <p className="text-sm text-gray-700">
                                        Realizá la transferencia o depósito a la siguiente cuenta y enviá el comprobante.
                                    </p>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">CBU</p>
                                            <p className="font-mono font-semibold">0000003100012345678901</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Alias</p>
                                            <p className="font-semibold">HEADD.CLUB</p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-3">
                                        <p className="text-xs text-gray-500 uppercase">Titular</p>
                                        <p className="font-semibold">Rosario Sanchez</p>
                                    </div>
                                </div>

                                {/* Upload comprobante */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Subí tu comprobante</h4>

                                    {order.paymentProof ? (
                                        <div className="space-y-3">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-green-800 font-medium mb-2">✅ Comprobante subido exitosamente</p>
                                                <img
                                                    src={order.paymentProof}
                                                    alt="Comprobante"
                                                    className="max-w-full h-auto rounded-lg border border-gray-300"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Revisaremos tu comprobante y confirmaremos tu pedido pronto.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={onFileUpload}
                                                disabled={uploading}
                                                className="hidden"
                                                id="payment-proof-upload"
                                            />
                                            <label
                                                htmlFor="payment-proof-upload"
                                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
                                            >
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Spinner />
                                                        <p className="text-sm text-gray-600">Subiendo...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg className="w-12 h-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            <span className="text-blue-600 font-medium">Hacé click para seleccionar</span> o arrastrá la imagen
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                                                    </>
                                                )}
                                            </label>

                                            {uploadSuccess && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <p className="text-green-800 font-medium">✅ Comprobante subido correctamente</p>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-600">
                                                También podés enviarlo por email a{' '}
                                                <a href="mailto:headd.clubpagos@gmail.com" className="text-blue-600 hover:underline">
                                                    headd.clubpagos@gmail.com
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-gray-600 border-t pt-3">
                                    Despacho: Lunes, miércoles y viernes. Tu pedido será enviado en esos días.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-2">💳 Pago procesado con Mercado Pago</p>
                                <p className="text-sm text-gray-700">
                                    Tu pago fue procesado de forma segura. Recibirás un email de confirmación.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Columna lateral (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Resumen */}
                    <Card variant="bordered">
                        <h3 className="text-lg font-semibold mb-4">Resumen</h3>
                        <div className={orderSummary.container}>
                            <div className={orderSummary.row}>
                                <span className={orderSummary.label}>Subtotal</span>
                                <span className={orderSummary.value}>
                                    ${((order.total || 0) - (order.shippingCost || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className={orderSummary.row}>
                                <span className={orderSummary.label}>Envío</span>
                                <span className={orderSummary.value}>${(order.shippingCost || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className={orderSummary.divider}></div>
                            <div className={orderSummary.totalRow}>
                                <span className={orderSummary.totalLabel}>Total</span>
                                <span className={orderSummary.totalValue}>${(order.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Datos de envío */}
                    <Card variant="bordered">
                        <h3 className="text-lg font-semibold mb-3">Envío</h3>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-gray-600">{order.customerPhone}</p>
                            <p className="text-gray-600">{order.email}</p>
                            <div className="border-t pt-3 mt-3">
                                <p className="text-gray-600">
                                    {order.shippingAddress}
                                    {order.shippingNeighborhood && `, ${order.shippingNeighborhood}`}
                                </p>
                                <p className="text-gray-600">
                                    {order.shippingCity}, CP {order.shippingPostalCode}
                                </p>
                                <p className="text-gray-600">{order.shippingState}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Método de envío */}
                    <Card variant="bordered">
                        <h3 className="text-lg font-semibold mb-2">Método de envío</h3>
                        <p className="text-sm text-gray-600">
                            Correo Argentino - Envío a domicilio
                        </p>
                    </Card>
                </div>
            </div>

            {/* Footer con botones */}
            <div className="border-t pt-6 mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => navigate('/products')}
                        variant="outline"
                        className="flex-1"
                    >
                        Seguir comprando
                    </Button>
                    <Button
                        onClick={() => navigate('/orders')}
                        className="flex-1"
                    >
                        Ver mis pedidos
                    </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                    ¿Necesitás ayuda?{' '}
                    <a href="mailto:headd.clubpagos@gmail.com" className="text-blue-600 hover:underline">
                        Contactanos
                    </a>
                </p>
            </div>
        </motion.div>
    );
}
