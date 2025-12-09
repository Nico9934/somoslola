import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../../api/products';
import { categoriesService } from '../../api/categories';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import HeroCarousel from '../../components/customer/HeroCarousel';
import ProductFilters from '../../components/customer/ProductFilters';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { text, layout, products as productStyles, inputs } from '../../styles';

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
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { addItem } = useCart();
    const { user } = useAuth();
    const observerRef = useRef();
    const lastProductRef = useRef();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Definir loadProducts ANTES de usarlo en useEffect
    const loadProducts = useCallback(async (pageNum, isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = {
                page: pageNum,
                limit: 12,
                ...(selectedFilters.categoryId && { categoryId: selectedFilters.categoryId }),
                ...(selectedFilters.brandId && { brandId: selectedFilters.brandId }),
                ...(searchTerm && { search: searchTerm })
            };

            const response = await api.get('/products', { params });
            const { products: newProducts, pagination } = response.data;

            setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
            setHasMore(pagination.hasMore);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedFilters.categoryId, selectedFilters.brandId, searchTerm]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [categoriesData, brandsData, bannersData] = await Promise.all([
                    categoriesService.getAll(),
                    api.get('/brands'),
                    api.get('/hero-banners'),
                ]);
                setCategories(categoriesData);
                setBrands(brandsData.data);
                setBanners(bannersData.data);

                // Cargar primera página de productos
                setLoading(true);
                const params = { page: 1, limit: 12 };
                const response = await api.get('/products', { params });
                const { products: newProducts, pagination } = response.data;
                setProducts(newProducts);
                setHasMore(pagination.hasMore);
                setLoading(false);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Reset cuando cambian los filtros
    useEffect(() => {
        // NO vaciar productos inmediatamente, solo resetear página
        setPage(1);
        setHasMore(true);

        // Cargar productos con nuevos filtros (loadProducts internamente reemplazará los productos)
        loadProducts(1, true);
    }, [selectedFilters.categoryId, selectedFilters.brandId, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    // Intersection Observer para lazy loading
    useEffect(() => {
        if (loading || loadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (lastProductRef.current) {
            observer.observe(lastProductRef.current);
        }

        return () => {
            if (lastProductRef.current) {
                observer.unobserve(lastProductRef.current);
            }
        };
    }, [loading, loadingMore, hasMore]);

    // Cargar más productos cuando cambia la página
    useEffect(() => {
        if (page > 1) {
            loadProducts(page, false);
        }
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps


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

    // Filtrado de precio en el cliente (solo para rango de precio, ya que el backend no lo maneja)
    const filteredProducts = products.filter(product => {
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

    return (
        <Layout>
            {banners.length > 0 && <HeroCarousel banners={banners} />}

            <div className={layout.containerXWide}>
                <div className="flex gap-8">
                    {/* Filtros laterales - Desktop */}
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

                    {/* Drawer de filtros - Mobile */}
                    {isFilterDrawerOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/50 z-[90] lg:hidden animate-fadeIn"
                                onClick={() => setIsFilterDrawerOpen(false)}
                            />

                            {/* Drawer */}
                            <div
                                className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-[100] lg:hidden overflow-y-auto animate-slideInLeft"
                                onClick={(e) => e.stopPropagation()}>
                                <div className="p-4 flex flex-col h-full">
                                    {/* Header con botón cerrar */}
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                        <h2 className="text-lg font-semibold">Filtros</h2>
                                        <button
                                            onClick={() => setIsFilterDrawerOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    {/* Filtros */}
                                    <div className="flex-1">
                                        <ProductFilters
                                            categories={categories}
                                            brands={brands}
                                            selectedFilters={selectedFilters}
                                            onFilterChange={handleFilterChange}
                                            onClearFilters={handleClearFilters}
                                            productCount={filteredProducts.length}
                                        />
                                    </div>

                                    {/* Login/Register - Footer del drawer */}
                                    {!user && (
                                        <div className="pt-4 border-t border-gray-200 mt-auto space-y-2">
                                            <Link
                                                to="/login"
                                                onClick={() => setIsFilterDrawerOpen(false)}
                                                className="block w-full text-center py-2.5 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                                            >
                                                Iniciar sesión
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setIsFilterDrawerOpen(false)}
                                                className="block w-full text-center py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                            >
                                                Crear cuenta
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Contenido principal */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className={text.pageTitle}>Productos</h1>

                            {/* Botón hamburguesa para filtros - Solo mobile */}
                            <button
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <SlidersHorizontal size={20} />
                                <span className="text-sm font-medium">Filtros</span>
                            </button>
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

                        {/* Contenedor de productos con posición relativa para el spinner */}
                        <div className="relative min-h-[400px]">
                            {filteredProducts.length === 0 ? (
                                loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Spinner size="lg" />
                                    </div>
                                ) : (
                                    <p className={`${text.muted} text-center`}>No hay productos disponibles</p>
                                )
                            ) : (
                                <>
                                    {loading && (
                                        <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-lg">
                                            <Spinner size="lg" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredProducts.map((product, index) => {
                                            const variantWithImage = product.variants?.find(v => v.images?.length > 0);
                                            const imageUrl = variantWithImage?.images[0]?.url;

                                            const hasPromo = product.variants.some(v => v.promotionPrice);
                                            const minPrice = Math.min(...product.variants.map(v => v.salePrice));
                                            const promoPrice = hasPromo
                                                ? Math.min(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice))
                                                : null;

                                            // Calcular precio de transferencia preferentemente usando el valor que provee el backend
                                            const transferCandidates = product.variants.map(v => {
                                                // si backend provee transferPrice, úsalo
                                                if (typeof v.transferPrice === 'number') return v.transferPrice;
                                                // si hay promotionPrice usarla, sino salePrice
                                                const base = (v.promotionPrice && v.promotionPrice > 0) ? v.promotionPrice : v.salePrice;
                                                return Math.round(base * 0.9); // fallback: 10% descuento
                                            });
                                            const minTransferPrice = Math.min(...transferCandidates);

                                            // Calcular cuotas (installment) mínimas
                                            const installmentCandidates = product.variants.map(v => {
                                                if (typeof v.installmentPrice === 'number') return v.installmentPrice;
                                                const base = (v.promotionPrice && v.promotionPrice > 0) ? v.promotionPrice : v.salePrice;
                                                return Math.round(base / 3);
                                            });
                                            const minInstallmentPrice = Math.min(...installmentCandidates);

                                            // Agregar ref al último producto para el observer
                                            const isLastProduct = index === filteredProducts.length - 1;

                                            return (
                                                <div
                                                    key={product.id}
                                                    className={productStyles.productCard}
                                                    ref={isLastProduct ? lastProductRef : null}
                                                >

                                                    {/* Imagen */}
                                                    <Link to={`/products/${product.id}`} className={productStyles.productCardImageWrap}>

                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt={product.name} className={productStyles.productCardImage} />
                                                        ) : (
                                                            <div className="flex items-center justify-center text-gray-400">Sin imagen</div>
                                                        )}

                                                        {/* Badge promo */}
                                                        {hasPromo && (
                                                            <span className={productStyles.productCardBadge}>OFERTA</span>
                                                        )}

                                                        {/* Favoritos */}
                                                        <button className={productStyles.productCardFavBtn}>
                                                            <FaHeart className="text-gray-400 hover:text-red-500" />
                                                        </button>
                                                    </Link>

                                                    {/* Cuerpo */}
                                                    <div className={productStyles.productCardBody}>
                                                        <div className="space-y-2">
                                                            <p className={productStyles.productCardCategory}>{product.category?.name}</p>

                                                            <Link to={`/products/${product.id}`}>
                                                                <h3 className={productStyles.productCardName}>{product.name}</h3>
                                                            </Link>

                                                            {/* Precio y colores en línea */}
                                                            <div className="flex items-center justify-between gap-2">
                                                                {/* Precios - Espacio reservado para mantener altura uniforme */}
                                                                <div className="min-h-[3rem]">
                                                                    {hasPromo ? (
                                                                        <>
                                                                            <p className={productStyles.productCardPrice}>${promoPrice.toLocaleString("es-AR")}</p>
                                                                            <p className={productStyles.productCardPriceOld}>${minPrice.toLocaleString("es-AR")}</p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <p className={productStyles.productCardPrice}>${minPrice.toLocaleString("es-AR")}</p>
                                                                            <p className="h-5"></p>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Colores - Mostrar si al menos una variante tiene color */}
                                                                {(() => {
                                                                    const findColor = (v) => {
                                                                        const av = v.attributeValues?.find(a => a?.attributeValue?.hexColor || a?.attribute_value?.hexColor || a?.hexColor);
                                                                        return av?.attributeValue?.hexColor || av?.attribute_value?.hexColor || av?.hexColor;
                                                                    };
                                                                    const variantsWithColor = product.variants.filter(v => findColor(v));

                                                                    if (variantsWithColor.length === 0) return null;

                                                                    return (
                                                                        <div className={productStyles.productCardColors}>
                                                                            {variantsWithColor.slice(0, 4).map(variant => {
                                                                                const color = findColor(variant);
                                                                                return <div key={variant.id} className={productStyles.productCardColorDot} style={{ backgroundColor: color }} />;
                                                                            })}
                                                                            {variantsWithColor.length > 4 && (
                                                                                <span className="text-xs text-gray-400">+{variantsWithColor.length - 4}</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Footer con info de pagos */}
                                                        <div className={productStyles.productCardFooter}>
                                                            <p className={productStyles.productCardTransferPrice}>
                                                                ${minTransferPrice.toLocaleString("es-AR")} Transferencia
                                                            </p>
                                                            {product.variants[0]?.paymentOptions?.installmentsActive && (
                                                                <p className={productStyles.productCardInstallments}>
                                                                    {product.variants[0]?.paymentOptions?.installments || 3} cuotas sin interés de ${minInstallmentPrice.toLocaleString("es-AR")}
                                                                </p>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleAddToCart(product.variants[0].id);
                                                                }}
                                                                className="w-full mt-3 bg-black text-white text-sm px-4 py-2.5 rounded-none hover:bg-warm-50 hover:text-black hover:border hover:border-black transition-all duration-300 flex items-center justify-center gap-2"
                                                            >
                                                                <FaShoppingCart />
                                                                Agregar al carrito
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Skeleton loader mientras carga más productos */}
                                    {loadingMore && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                                                    <div className="w-full h-64 bg-gray-200"></div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                        <div className="h-10 bg-gray-200 rounded"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Mensaje cuando no hay más productos */}
                                    {!hasMore && filteredProducts.length > 0 && (
                                        <p className="text-center text-gray-500 mt-8 text-sm">
                                            Has visto todos los productos disponibles
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
