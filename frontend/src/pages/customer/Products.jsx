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

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [banners, setBanners] = useState([]);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-primary mb-4">Productos</h1>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <p className="text-center text-muted">No hay productos disponibles</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                        {/* Badge de promoción */}
                                        {product.variants?.some(v => v.promotionPrice) && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
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
                                                        <p className="text-muted text-sm">Sin imagen</p>
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
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                {product.category?.name}
                                            </p>

                                            {/* Nombre */}
                                            <Link to={`/products/${product.id}`}>
                                                <h3 className="font-semibold text-gray-800 mb-2 hover:text-secondary transition-colors line-clamp-2 min-h-[3rem]">
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
                                                const minPromoPrice = hasPromotion ? Math.min(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice)) : null;

                                                return (
                                                    <div className="mb-4">
                                                        {hasPromotion ? (
                                                            <>
                                                                <p className="text-sm text-gray-400 line-through">
                                                                    ${minSalePrice.toLocaleString()}
                                                                </p>
                                                                <p className="text-xl font-bold text-red-600">
                                                                    ${minPromoPrice.toLocaleString()}
                                                                </p>
                                                                <p className="text-xs text-green-600 font-semibold">
                                                                    6x ${(minPromoPrice / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })} sin interés
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-xl font-bold text-gray-900">
                                                                    ${minSalePrice.toLocaleString()}
                                                                </p>
                                                                <p className="text-xs text-green-600 font-semibold">
                                                                    6x ${(minSalePrice / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })} sin interés
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Botón de agregar */}
                                            {product.variants && product.variants.length > 0 && (
                                                <Button

                                                    onClick={() => handleAddToCart(product.variants[0].id)}
                                                    className="w-full flex items-center justify-around bg-primary hover:bg-secondary transition-colors"
                                                >
                                                    <FaShoppingCart className="mr-2" /> Agregar al carrito
                                                </Button>
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
