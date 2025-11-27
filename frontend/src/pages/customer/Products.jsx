import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../../api/products';
import { categoriesService } from '../../api/categories';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import HeroCarousel from '../../components/customer/HeroCarousel';
import ProductFilters from '../../components/customer/ProductFilters';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { Search } from 'lucide-react';
import { text, badges, layout, buttons, products as productStyles, inputs } from '../../styles';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        categoryId: null,
        brandId: null,
        priceRange: null
    });
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, categoriesData, brandsData, bannersData] = await Promise.all([
                productsService.getAll(),
                categoriesService.getAll(),
                api.get('/brands'),
                api.get('/hero-banners'),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setBrands(brandsData.data);
            setBanners(bannersData.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (variantId) => {
        try {
            await addItem(variantId, 1);
            toast.success('✅ Producto agregado al carrito');
        } catch (error) {
            toast.error('Error al agregar al carrito');
        }
    };

    const handleFilterChange = (filterType, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleClearFilters = () => {
        setSelectedFilters({
            categoryId: null,
            brandId: null,
            priceRange: null
        });
    };

    const filteredProducts = products.filter(product => {
        // Filtro por búsqueda (nombre)
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Filtro por categoría
        if (selectedFilters.categoryId && product.categoryId !== selectedFilters.categoryId) {
            return false;
        }

        // Filtro por marca
        if (selectedFilters.brandId && product.brandId !== selectedFilters.brandId) {
            return false;
        }

        // Filtro por rango de precio
        if (selectedFilters.priceRange && product.variants && product.variants.length > 0) {
            const { min, max } = selectedFilters.priceRange;
            const productMinPrice = Math.min(...product.variants.map(v => v.promotionPrice || v.salePrice));

            if (productMinPrice < min || productMinPrice > max) {
                return false;
            }
        }

        return true;
    });

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
            {banners.length > 0 && <HeroCarousel banners={banners} />}

            <div className={layout.containerXWide}>
                <div className="flex gap-8">
                    {/* Filtros laterales */}
                    <aside className="hidden lg:block">
                        <ProductFilters
                            categories={categories}
                            brands={brands}
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            productCount={filteredProducts.length}
                        />
                    </aside>

                    {/* Contenido principal */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className={text.pageTitle}>Productos</h1>
                        </div>

                        {/* Buscador */}
                        <div className="mb-12 w-full flex justify-end gap-3 items-center">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`${inputs.text} w-full pl-10 pr-10`}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <p className={`${text.muted} mt-2`}>
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            )}
                        </div>

                        {filteredProducts.length === 0 ? (
                            <p className={`${text.muted} text-center`}>No hay productos disponibles</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                        {/* Badge de promoción */}
                                        {product.variants?.some(v => v.promotionPrice) && (
                                            <div className={`absolute top-3 left-3 z-10 ${badges.error}`}>
                                                OFERTA
                                            </div>
                                        )}

                                        {/* Botón de favoritos */}
                                        <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50">
                                            <FaHeart className="text-gray-400 hover:text-red-500" />
                                        </button>

                                        {/* Imagen del producto - primera variante con imagen */}
                                        <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-gray-50 aspect-square">
                                            {(() => {
                                                // Buscar primera variante con imagen
                                                const variantWithImage = product.variants?.find(v => v.images && v.images.length > 0);
                                                const imageUrl = variantWithImage?.images[0]?.url;

                                                return imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <p className={text.muted}>Sin imagen</p>
                                                    </div>
                                                );
                                            })()}

                                            {/* Overlay con botón de vista rápida */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                                {/* <Button
                                        variant="outline"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                                    >
                                        <FaEye className="mr-2" /> Vista rápida
                                    </Button> */}
                                            </div>
                                        </Link>

                                        {/* Contenido */}
                                        <div className="p-4">
                                            {/* Categoría */}
                                            <p className={productStyles.meta}>
                                                {product.category?.name}
                                            </p>

                                            {/* Nombre */}
                                            <Link to={`/products/${product.id}`}>
                                                <h3 className={`${productStyles.name} hover:text-black transition-colors line-clamp-2 min-h-[3rem]`}>
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Colores disponibles */}
                                            {product.variants && product.variants.length > 0 && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    {product.variants.slice(0, 5).map((variant) => {
                                                        const colorAttr = variant.attributeValues?.find(
                                                            av => av.attributeValue.hexColor
                                                        );
                                                        if (colorAttr) {
                                                            return (
                                                                <div
                                                                    key={variant.id}
                                                                    className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                                                    style={{ backgroundColor: colorAttr.attributeValue.hexColor }}
                                                                    title={colorAttr.attributeValue.value}
                                                                />
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    {product.variants.length > 5 && (
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            +{product.variants.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Precio */}
                                            {product.variants && product.variants.length > 0 && (() => {
                                                const hasPromotion = product.variants.some(v => v.promotionPrice);
                                                const minSalePrice = Math.min(...product.variants.map(v => v.salePrice));
                                                const minTransferPrice = Math.min(...product.variants.map(v => v.transferPrice));
                                                const minInstallmentPrice = Math.min(...product.variants.map(v => v.installmentPrice));
                                                const minPromoPrice = hasPromotion ? Math.min(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice)) : null;
                                                const paymentOptions = product.variants[0]?.paymentOptions;

                                                return (
                                                    <div className="mb-4 space-y-1">
                                                        {hasPromotion ? (
                                                            <>
                                                                <p className={`${productStyles.meta} line-through`}>
                                                                    ${minSalePrice.toLocaleString('es-AR')}
                                                                </p>
                                                                <p className={productStyles.pricePromo}>
                                                                    ${minPromoPrice.toLocaleString('es-AR')}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className={productStyles.price}>
                                                                ${minSalePrice.toLocaleString('es-AR')}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-green-600 font-semibold">
                                                            💳 ${minTransferPrice.toLocaleString('es-AR')} transferencia
                                                        </p>
                                                        {paymentOptions?.installmentsActive && minInstallmentPrice && (
                                                            <p className="text-xs text-blue-600">
                                                                {paymentOptions.installments} cuotas de ${minInstallmentPrice.toLocaleString('es-AR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Botón de agregar */}
                                            {product.variants && product.variants.length > 0 && (
                                                <button
                                                    onClick={() => handleAddToCart(product.variants[0].id)}
                                                    className={`${buttons.primary} ${buttons.full} flex items-center justify-center gap-2 group`}
                                                >
                                                    <FaShoppingCart className="text-sm" />
                                                    <span className="text-sm">Agregar</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
