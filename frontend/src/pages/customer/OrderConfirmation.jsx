import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await ordersService.getOrderById(orderId);
                setOrder(data);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar 5MB');
            return;
        }

        setUploading(true);

        try {
            // Subir imagen al backend (Cloudinary)
            const formData = new FormData();
            formData.append('image', file);

            const uploadResponse = await fetch('http://localhost:4000/upload/payment-proof', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.url) {
                throw new Error('Error al subir imagen');
            }

            // Guardar URL en la orden
            await ordersService.uploadPaymentProof(orderId, uploadData.url);

            // Actualizar orden local
            setOrder({ ...order, paymentProof: uploadData.url });
            setUploadSuccess(true);

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error('Error al subir comprobante:', error);
            alert('Error al subir el comprobante. Por favor intenta de nuevo.');
        } finally {
            setUploading(false);
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
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header de confirmación - Minimalista */}
                <div className="border-b-2 border-black pb-8 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 border-2 border-black flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Pedido confirmado
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">
                        Gracias por tu compra. Te enviaremos tu pedido lo antes posible.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Número de pedido: <strong className="text-black font-mono">#{order.id}</strong>
                    </p>
                </div>

                {/* Grid de 2 columnas en desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna principal (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Productos */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                                Productos
                            </h2>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="w-20 h-20 object-cover bg-gray-100"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-base mb-1">{item.productName}</p>
                                            <p className="text-sm text-gray-500 mb-1">SKU: {item.variantSku}</p>
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
                                        <div className="text-right flex flex-col justify-between">
                                            <p className="font-medium text-base">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">${(item.price || 0).toFixed(2)} c/u</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                                Información de pago
                            </h2>

                            {order.paymentMethod === 'TRANSFER' ? (
                                <>
                                    <div className="bg-gray-50 border border-gray-300 p-6 mb-4">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Estado</p>
                                        <p className="font-medium mb-4">En espera de pago</p>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Realizá la transferencia o depósito a la siguiente cuenta y enviá el comprobante al email indicado abajo.
                                        </p>
                                    </div>

                                    <div className="border border-gray-300 p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">CBU</p>
                                                <p className="font-mono text-sm font-medium">0000003100012345678901</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Alias</p>
                                                <p className="font-medium">HEADD.CLUB</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Titular</p>
                                            <p className="font-medium">Rosario Sanchez</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border border-gray-300 p-6">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                                            Subí tu comprobante aquí
                                        </p>

                                        {order.paymentProof ? (
                                            <div className="space-y-3">
                                                <div className="bg-green-50 border border-green-200 p-4 rounded">
                                                    <p className="text-sm text-green-800 font-medium mb-2">
                                                        ✅ Comprobante subido exitosamente
                                                    </p>
                                                    <img
                                                        src={order.paymentProof}
                                                        alt="Comprobante"
                                                        className="w-full max-w-sm rounded border border-gray-300"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    Revisaremos tu comprobante y confirmaremos tu pedido pronto.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="block">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        disabled={uploading}
                                                        className="hidden"
                                                        id="payment-proof-upload"
                                                    />
                                                    <div
                                                        onClick={() => document.getElementById('payment-proof-upload').click()}
                                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                                    >
                                                        {uploading ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Spinner />
                                                                <p className="text-sm text-gray-600">Subiendo...</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    <span className="font-medium text-black">Hacé click para seleccionar</span> o arrastrá la imagen aquí
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    PNG, JPG hasta 5MB
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </label>

                                                {uploadSuccess && (
                                                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                                                        <p className="text-sm text-green-800 font-medium">
                                                            ✅ Comprobante subido correctamente
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-600">
                                                    También podés enviarlo por email a{' '}
                                                    <a href="mailto:headd.clubpagos@gmail.com" className="text-black underline font-medium">
                                                        headd.clubpagos@gmail.com
                                                    </a>
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-200">
                                            Despacho: Lunes, miércoles y viernes. Tu pedido será enviado en esos días.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-gray-50 border border-gray-300 p-6">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Método</p>
                                    <p className="font-medium mb-4">Tarjeta de crédito/débito</p>
                                    <div className="bg-blue-50 border border-blue-200 p-4 mt-4">
                                        <p className="text-sm text-blue-900 font-medium mb-2">💳 Pago procesado con Mercado Pago</p>
                                        <p className="text-xs text-blue-800">
                                            Tu pago fue procesado de forma segura. Recibirás un email de confirmación.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Columna lateral (1/3) */}
                    <div className="space-y-6">
                        {/* Totales */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                                Resumen
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${((order.total || 0) - (order.shippingCost || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Envío</span>
                                    <span className="font-medium">${(order.shippingCost || 0).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-300 pt-3">
                                    <div className="flex justify-between text-base">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold">${(order.total || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Datos de envío */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                                Envío
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-gray-600">{order.customerPhone}</p>
                                <p className="text-gray-600">{order.email}</p>
                                <div className="pt-3 mt-3 border-t border-gray-200">
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
                        </div>

                        {/* Método de envío */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                                Método de envío
                            </h2>
                            <p className="text-sm text-gray-600">
                                Correo Argentino - Envío a domicilio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer con acciones */}
                <div className="mt-12 pt-8 border-t border-gray-300">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button
                            onClick={() => navigate('/products')}
                            className="px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors"
                        >
                            Seguir comprando
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                        >
                            Ver mis pedidos
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            ¿Necesitás ayuda?{' '}
                            <a href="mailto:headd.clubpagos@gmail.com" className="text-black underline font-medium hover:no-underline">
                                Contactanos
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
