import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Spinner from '../../components/ui/Spinner';
import { layout, text, cards, buttons, alerts, upload, products, icons } from '../../styles';
import { successHeader, orderSummary, actionFooter } from '../../styles/components';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

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
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
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
            // Limpiar el input para permitir subir el mismo archivo de nuevo
            if (fileInputRef.current) fileInputRef.current.value = '';
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
            <div className={layout.container}>
                {/* Header de confirmación */}
                <div className={successHeader.container}>
                    <div className={successHeader.iconWrapper}>
                        <div className={successHeader.icon}>
                            <svg className={icons.check} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className={successHeader.title}>
                            Pedido confirmado
                        </h1>
                    </div>
                    <p className={successHeader.subtitle}>
                        Gracias por tu compra. Te enviaremos tu pedido lo antes posible.
                    </p>
                    <p className={successHeader.meta}>
                        Número de pedido: <strong className="text-black font-mono">#{order.id}</strong>
                    </p>
                </div>

                {/* Grid de 2 columnas en desktop */}
                <div className={layout.grid2Col}>
                    {/* Columna principal (2/3) */}
                    <div className={layout.gridMain}>
                        {/* Productos */}
                        <div>
                            <h2 className={text.sectionTitle}>
                                Productos
                            </h2>
                            <div className={layout.stackMd}>
                                {order.items?.map((item) => (
                                    <div key={item.id} className={products.item}>
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className={products.image}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={products.name}>{item.productName}</p>
                                            <p className={products.meta}>SKU: {item.variantSku}</p>
                                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                <p className={products.meta}>
                                                    {Object.entries(item.attributes).map(([key, value]) => (
                                                        <span key={key} className="mr-3">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </p>
                                            )}
                                            <p className={`${products.meta} mt-1`}>Cantidad: {item.quantity}</p>
                                        </div>
                                        <div className="text-right flex flex-col justify-between">
                                            <p className={text.value}>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                            <p className={text.mutedXs}>${(item.price || 0).toFixed(2)} c/u</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div>
                            <h2 className={text.sectionTitle}>
                                Información de pago
                            </h2>

                            {order.paymentMethod === 'TRANSFER' ? (
                                <>
                                    <div className={`${cards.background} mb-4`}>
                                        <p className={text.label}>Estado</p>
                                        <p className={`${text.value} mb-4`}>En espera de pago</p>
                                        <p className={text.mutedLeading}>
                                            Realizá la transferencia o depósito a la siguiente cuenta y enviá el comprobante al email indicado abajo.
                                        </p>
                                    </div>

                                    <div className={`${cards.bordered} ${layout.stackMd}`}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={text.label}>CBU</p>
                                                <p className={text.valueMono}>0000003100012345678901</p>
                                            </div>
                                            <div>
                                                <p className={text.label}>Alias</p>
                                                <p className={text.value}>HEADD.CLUB</p>
                                            </div>
                                        </div>
                                        <div className={layout.dividerLight}>
                                            <p className={text.label}>Titular</p>
                                            <p className={text.value}>Rosario Sanchez</p>
                                        </div>
                                    </div>

                                    <div className={`${cards.bordered} mt-4`}>
                                        <p className={text.labelBlock}>
                                            Subí tu comprobante aquí
                                        </p>

                                        {order.paymentProof ? (
                                            <div className={layout.stack}>
                                                <div className={alerts.success}>
                                                    <p className={`${alerts.successText} mb-2`}>
                                                        ✅ Comprobante subido exitosamente
                                                    </p>
                                                    <img
                                                        src={order.paymentProof}
                                                        alt="Comprobante"
                                                        className={upload.preview}
                                                    />
                                                </div>
                                                <p className={text.mutedXs}>
                                                    Revisaremos tu comprobante y confirmaremos tu pedido pronto.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className={layout.stack}>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    className="hidden"
                                                    id="payment-proof-upload"
                                                />
                                                <label
                                                    htmlFor="payment-proof-upload"
                                                    className={upload.zone}
                                                >
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Spinner />
                                                            <p className={upload.text}>Subiendo...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg className={upload.icon} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <p className={upload.text}>
                                                                <span className={upload.textHighlight}>Hacé click para seleccionar</span> o arrastrá la imagen aquí
                                                            </p>
                                                            <p className={upload.textHint}>
                                                                PNG, JPG hasta 5MB
                                                            </p>
                                                        </>
                                                    )}
                                                </label>

                                                {uploadSuccess && (
                                                    <div className={alerts.success}>
                                                        <p className={alerts.successText}>
                                                            ✅ Comprobante subido correctamente
                                                        </p>
                                                    </div>
                                                )}

                                                <p className={text.mutedXs}>
                                                    También podés enviarlo por email a{' '}
                                                    <a href="mailto:headd.clubpagos@gmail.com" className={buttons.link}>
                                                        headd.clubpagos@gmail.com
                                                    </a>
                                                </p>
                                            </div>
                                        )}

                                        <p className={`${text.mutedLeading} mt-4 pt-4 ${layout.dividerLight}`}>
                                            Despacho: Lunes, miércoles y viernes. Tu pedido será enviado en esos días.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className={cards.background}>
                                    <p className={text.label}>Método</p>
                                    <p className={`${text.value} mb-4`}>Tarjeta de crédito/débito</p>
                                    <div className={`${alerts.info} mt-4`}>
                                        <p className={`${alerts.infoText} mb-2`}>💳 Pago procesado con Mercado Pago</p>
                                        <p className={text.mutedXs}>
                                            Tu pago fue procesado de forma segura. Recibirás un email de confirmación.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Columna lateral (1/3) */}
                    <div className={layout.gridSidebar}>
                        {/* Totales */}
                        <div>
                            <h2 className={text.sectionTitle}>
                                Resumen
                            </h2>
                            <div className={orderSummary.container}>
                                <div className={orderSummary.row}>
                                    <span className={orderSummary.label}>Subtotal</span>
                                    <span className={orderSummary.value}>${((order.total || 0) - (order.shippingCost || 0)).toFixed(2)}</span>
                                </div>
                                <div className={orderSummary.row}>
                                    <span className={orderSummary.label}>Envío</span>
                                    <span className={orderSummary.value}>${(order.shippingCost || 0).toFixed(2)}</span>
                                </div>
                                <div className={orderSummary.divider}>
                                    <div className={orderSummary.total}>
                                        <span className={orderSummary.totalLabel}>Total</span>
                                        <span className={orderSummary.totalValue}>${(order.total || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Datos de envío */}
                        <div>
                            <h2 className={text.sectionTitle}>
                                Envío
                            </h2>
                            <div className={`${layout.stackSm} ${text.sm}`}>
                                <p className={text.value}>{order.customerName}</p>
                                <p className={text.muted}>{order.customerPhone}</p>
                                <p className={text.muted}>{order.email}</p>
                                <div className={layout.dividerLight}>
                                    <p className={text.muted}>
                                        {order.shippingAddress}
                                        {order.shippingNeighborhood && `, ${order.shippingNeighborhood}`}
                                    </p>
                                    <p className={text.muted}>
                                        {order.shippingCity}, CP {order.shippingPostalCode}
                                    </p>
                                    <p className={text.muted}>{order.shippingState}</p>
                                </div>
                            </div>
                        </div>

                        {/* Método de envío */}
                        <div>
                            <h2 className={text.sectionTitle}>
                                Método de envío
                            </h2>
                            <p className={text.muted}>
                                Correo Argentino - Envío a domicilio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer con acciones */}
                <div className={actionFooter.container}>
                    <div className={actionFooter.buttons}>
                        <button
                            onClick={() => navigate('/products')}
                            className={buttons.secondary}
                        >
                            Seguir comprando
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className={buttons.primary}
                        >
                            Ver mis pedidos
                        </button>
                    </div>

                    <div className={actionFooter.help}>
                        <p>
                            ¿Necesitás ayuda?{' '}
                            <a href="mailto:headd.clubpagos@gmail.com" className={buttons.link}>
                                Contactanos
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
