import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsService } from '../../api/products';
import { useCart } from '../../context/CartContext';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import PriceDisplay from '../../components/customer/PriceDisplay';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaBox, FaTag, FaDollarSign } from 'react-icons/fa';
import { text, badges, layout, buttons, products as productStyles } from '../../styles';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Índice de imagen seleccionada
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        loadProduct();
    }, [id]);

    // Resetear índice de imagen cuando cambia la variante seleccionada
    useEffect(() => {
        setSelectedImageIndex(0);
    }, [selectedVariant]);

    const loadProduct = async () => {
        try {
            const data = await productsService.getById(id);
            setProduct(data);
            if (data.variants && data.variants.length > 0) {
                setSelectedVariant(data.variants[0]);
            }
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.warning('Por favor selecciona una variante');
            return;
        }

        console.log('🛒 Adding variant to cart:', {
            variantId: selectedVariant.id,
            sku: selectedVariant.sku,
            attributes: selectedVariant.attributeValues
        });

        try {
            await addItem(selectedVariant.id, quantity);
            toast.success('✅ Producto agregado al carrito');
            navigate('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);

            // Mostrar mensaje de error específico si viene del backend
            if (error.response?.data?.error) {
                const errorData = error.response.data;
                if (errorData.details) {
                    // Si hay detalles del error (stock insuficiente)
                    toast.error(
                        `${errorData.error}. Disponible: ${errorData.details.available}, ` +
                        `en carrito: ${errorData.details.inCart || 0}, ` +
                        `máximo a agregar: ${errorData.details.maxCanAdd || errorData.details.available}`
                    );
                } else {
                    toast.error(errorData.error);
                }
            } else {
                toast.error('Error al agregar al carrito');
            }
        }
    };

    // Obtener imagen actual a mostrar (de la variante seleccionada)
    const getCurrentImage = () => {
        if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
            // Mostrar imagen de la variante seleccionada
            if (selectedVariant.images[selectedImageIndex]) {
                return selectedVariant.images[selectedImageIndex].url;
            }
            return selectedVariant.images[0].url;
        }
        // Si no hay variante seleccionada, mostrar primera imagen de cualquier variante
        const variantWithImage = product.variants?.find(v => v.images && v.images.length > 0);
        if (variantWithImage && variantWithImage.images.length > 0) {
            return variantWithImage.images[selectedImageIndex]
                ? variantWithImage.images[selectedImageIndex].url
                : variantWithImage.images[0].url;
        }
        return null;
    };

    // Obtener todas las imágenes disponibles (de la variante seleccionada o primera con imágenes)
    const getAvailableImages = () => {
        if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
            return selectedVariant.images;
        }
        const variantWithImage = product.variants?.find(v => v.images && v.images.length > 0);
        return variantWithImage?.images || [];
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

    if (!product) {
        return (
            <Layout>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">Producto no encontrado</h2>
                    <Button onClick={() => navigate('/products')}>Volver a productos</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={layout.containerXWide}>
                <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4">
                    ← Volver
                </Button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Galería de imágenes */}
                    <div>
                        {(() => {
                            const images = getAvailableImages();
                            const currentImage = getCurrentImage();

                            return images.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Imagen principal */}
                                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square max-w-md mx-auto">
                                        <img
                                            src={currentImage}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {/* Miniaturas */}
                                    {images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer transition-all ${selectedImageIndex === idx
                                                        ? 'ring-2 ring-secondary'
                                                        : 'hover:ring-2 hover:ring-gray-300'
                                                        }`}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={`${product.name} ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                                    <p className={text.muted}>Sin imagen</p>
                                </div>
                            );
                        })()}
                    </div>

                    <div>
                        <h1 className={text.pageTitle}>{product.name}</h1>
                        <p className={`${text.muted} mb-4`}>{product.category?.name}</p>

                        {/* Mostrar precio de variante seleccionada o rango */}
                        {/* Precio con opciones de pago */}
                        {product.variants && product.variants.length > 0 && (() => {
                            if (selectedVariant) {
                                // Mostrar precio de la variante seleccionada
                                return (
                                    <div className="mb-6">
                                        <PriceDisplay
                                            salePrice={selectedVariant.salePrice}
                                            transferPrice={selectedVariant.transferPrice}
                                            installmentPrice={selectedVariant.installmentPrice}
                                            promotionPrice={selectedVariant.promotionPrice}
                                            paymentOptions={selectedVariant.paymentOptions}
                                            showInstallments={true}
                                        />
                                    </div>
                                );
                            } else {
                                // Mostrar rango de precios
                                const minSalePrice = Math.min(...product.variants.map(v => v.salePrice));
                                const minTransferPrice = Math.min(...product.variants.map(v => v.transferPrice));
                                const minInstallmentPrice = Math.min(...product.variants.map(v => v.installmentPrice));
                                const paymentOptions = product.variants[0]?.paymentOptions;

                                return (
                                    <div className="mb-6">
                                        <PriceDisplay
                                            salePrice={minSalePrice}
                                            transferPrice={minTransferPrice}
                                            installmentPrice={minInstallmentPrice}
                                            promotionPrice={null}
                                            paymentOptions={paymentOptions}
                                            showInstallments={true}
                                        />
                                        {product.variants.length > 1 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                * Precio desde. Seleccioná una variante para ver el precio exacto.
                                            </p>
                                        )}
                                    </div>
                                );
                            }
                        })()}

                        <p className={`${text.muted} mb-6`}>{product.description}</p>

                        {/* Tabla de variantes disponibles */}
                        {product.variants && product.variants.length > 0 && (
                            <Card variant="bordered" className="mb-6">
                                <h3 className={`${text.label} mb-4 flex items-center gap-2`}>
                                    <FaBox /> Variantes disponibles
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Atributos</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Stock</th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {product.variants.map((variant) => {
                                                const hasStock = variant.stock?.quantity > 0;
                                                const isSelected = selectedVariant?.id === variant.id;
                                                const hasPromotion = variant.promotionPrice && variant.promotionPrice > 0;

                                                return (
                                                    <tr
                                                        key={variant.id}
                                                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-secondary bg-opacity-10' : ''}`}
                                                    >
                                                        {/* SKU */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <FaTag className="text-gray-400" />
                                                                <span className="font-mono font-semibold text-gray-800">
                                                                    {variant.sku}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Atributos */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {variant.attributeValues && variant.attributeValues.length > 0 ? (
                                                                    variant.attributeValues.map((av) => {
                                                                        const attrValue = av.attributeValue;
                                                                        // Si tiene hexColor, mostrar círculo con texto
                                                                        if (attrValue.hexColor) {
                                                                            return (
                                                                                <div
                                                                                    key={av.id}
                                                                                    className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"
                                                                                >
                                                                                    <div
                                                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                                                        style={{ backgroundColor: attrValue.hexColor }}
                                                                                    />
                                                                                    <span className="text-xs font-medium text-gray-700">
                                                                                        {attrValue.value}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        // Badge normal
                                                                        return (
                                                                            <span
                                                                                key={av.id}
                                                                                className={badges.default}
                                                                            >
                                                                                {attrValue.attribute?.name}: {attrValue.value}
                                                                            </span>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">-</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Precio */}
                                                        <td className="px-4 py-3 text-right">
                                                            <div>
                                                                {hasPromotion ? (
                                                                    <>
                                                                        <p className={`${productStyles.meta} line-through`}>
                                                                            ${variant.salePrice.toLocaleString('es-AR')}
                                                                        </p>
                                                                        <p className={productStyles.pricePromo}>
                                                                            ${variant.promotionPrice.toLocaleString('es-AR')}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <p className={productStyles.price}>
                                                                        ${variant.salePrice.toLocaleString('es-AR')}
                                                                    </p>
                                                                )}
                                                                {variant.paymentOptions?.installmentsActive && variant.installmentPrice && (
                                                                    <p className="text-xs text-blue-600 mt-1">
                                                                        {variant.paymentOptions.installments}x ${variant.installmentPrice.toLocaleString('es-AR')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Stock */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className={`font-semibold ${hasStock ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {variant.stock?.quantity || 0}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {hasStock ? 'disponibles' : 'sin stock'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Acción */}
                                                        <td className="px-4 py-3 text-center">
                                                            <Button
                                                                onClick={() => setSelectedVariant(variant)}
                                                                disabled={!hasStock}
                                                                variant={isSelected ? 'primary' : 'outline'}
                                                                size="sm"
                                                            >
                                                                {isSelected ? 'Seleccionado ✓' : 'Seleccionar'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        <div className="mb-6">
                            <label className={`block mb-2 ${text.label}`}>
                                Cantidad:
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedVariant?.stock?.quantity || 1}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="w-24 px-4 py-2 border rounded-lg"
                            />
                        </div>

                        {/* Resumen de compra */}
                        {selectedVariant && (
                            <Card variant="bordered" className="mb-6 bg-gray-50">
                                <h4 className={`${text.label} mb-3 flex items-center gap-2`}>
                                    <FaShoppingCart /> Resumen de compra
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">SKU:</span>
                                        <span className="font-mono font-semibold">{selectedVariant.sku}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cantidad:</span>
                                        <span className="font-semibold">{quantity} unidad(es)</span>
                                    </div>
                                    {selectedVariant.promotionPrice ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Precio unitario:</span>
                                                <div className="text-right">
                                                    <p className={`${productStyles.meta} line-through`}>
                                                        ${selectedVariant.salePrice.toLocaleString()}
                                                    </p>
                                                    <p className={productStyles.pricePromo}>
                                                        ${selectedVariant.promotionPrice.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-800">Total:</span>
                                                <span className={`text-2xl ${productStyles.pricePromo}`}>
                                                    ${(selectedVariant.promotionPrice * quantity).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-600 font-semibold text-right">
                                                6x ${((selectedVariant.promotionPrice * quantity) / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })} sin interés
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Precio unitario:</span>
                                                <span className={productStyles.price}>${selectedVariant.salePrice.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-800">Total:</span>
                                                <span className={`text-2xl ${productStyles.price}`}>
                                                    ${(selectedVariant.salePrice * quantity).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-600 font-semibold text-right">
                                                6x ${((selectedVariant.salePrice * quantity) / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })} sin interés
                                            </p>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        <Button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || selectedVariant.stock?.quantity === 0}
                            className={`${buttons.full} flex items-center justify-center`}
                            size="lg"
                        >
                            <FaShoppingCart className="mr-2" />
                            {selectedVariant?.stock?.quantity === 0 ? 'Sin stock' : 'Agregar al carrito'}
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
