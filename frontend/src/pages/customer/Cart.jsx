import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function Cart() {
    const { cart, loading, updateItem, removeItem, clearCart, loadCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const cartId = localStorage.getItem('cartId');
        if (cartId && !cart) {
            loadCart(cartId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateQuantity = async (variantId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateItem(variantId, newQuantity);
            toast.success('Cantidad actualizada');
        } catch (error) {
            console.error('Error updating quantity:', error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al actualizar cantidad');
            }
        }
    };

    const handleRemove = async (variantId) => {
        try {
            await removeItem(variantId);
            toast.success('Producto eliminado del carrito');
        } catch {
            toast.error('Error al eliminar producto');
        }
    };

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) {
            toast.warning('El carrito está vacío');
            return;
        }

        // Redirigir al nuevo flujo de checkout
        navigate('/checkout');
    };

    const total = cart?.items?.reduce(
        (sum, item) => {
            const price = item.variant?.promotionPrice || item.variant?.salePrice || 0;
            return sum + price * item.quantity;
        },
        0
    ) || 0;

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
            <h1 className="text-3xl font-bold text-primary mb-6">Carrito de Compras</h1>

            {!cart || cart.items?.length === 0 ? (
                <Card>
                    <p className="text-center text-muted mb-4">Tu carrito está vacío</p>
                    <Button onClick={() => navigate('/products')} className="w-full">
                        Ir a productos
                    </Button>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => {
                            // Obtener primera imagen de la variante
                            const variantImage = item.variant?.images?.[0]?.url;

                            return (
                                <Card key={item.id}>
                                    <div className="flex gap-4">
                                        {/* Imagen de la variante */}
                                        {variantImage ? (
                                            <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={variantImage}
                                                    alt={item.variant?.product?.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">Sin imagen</span>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-primary">
                                                {item.variant?.product?.name}
                                            </h3>
                                            <p className="text-sm text-muted mb-1">{item.variant?.sku}</p>

                                            {/* Mostrar atributos de la variante */}
                                            {item.variant?.attributeValues && item.variant.attributeValues.length > 0 && (
                                                <div className="flex gap-2 mb-2">
                                                    {item.variant.attributeValues.map((av) => {
                                                        const attrValue = av.attributeValue;
                                                        // Si tiene hexColor, mostrar círculo
                                                        if (attrValue.hexColor) {
                                                            return (
                                                                <div key={av.id} className="flex items-center gap-1">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                                        style={{ backgroundColor: attrValue.hexColor }}
                                                                        title={attrValue.value}
                                                                    />
                                                                    <span className="text-xs text-gray-600">{attrValue.value}</span>
                                                                </div>
                                                            );
                                                        }
                                                        // Si no, mostrar badge
                                                        return (
                                                            <span
                                                                key={av.id}
                                                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                                            >
                                                                {attrValue.value}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {item.variant?.promotionPrice ? (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-400 line-through">
                                                        ${item.variant.salePrice.toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-bold text-red-600">
                                                            ${item.variant.promotionPrice.toLocaleString()}
                                                        </p>
                                                        <span className="text-xs font-semibold bg-red-100 text-red-600 px-1 py-0.5 rounded">
                                                            PROMO
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-bold text-secondary mt-2">
                                                    ${item.variant?.salePrice?.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(item.variantId)}
                                            >
                                                🗑️
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <div>
                        <Card>
                            <h2 className="text-xl font-bold text-primary mb-4">Resumen</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted">Subtotal:</span>
                                    <span>${total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span className="text-secondary">${total.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button onClick={handleCheckout} className="w-full" size="lg">
                                Finalizar Compra
                            </Button>
                        </Card>
                    </div>
                </div>
            )}
        </Layout>
    );
}
