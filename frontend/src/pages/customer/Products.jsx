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
                                {filteredProducts.map((product) => {
                                    const variantWithImage = product.variants?.find(v => v.images?.length > 0);
                                    const imageUrl = variantWithImage?.images[0]?.url;

                                    const hasPromo = product.variants.some(v => v.promotionPrice);
                                    const minPrice = Math.min(...product.variants.map(v => v.salePrice));
                                    const promoPrice = hasPromo
                                        ? Math.min(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice))
                                        : null;

                                    return (
                                        <div key={product.id} className={productStyles.productCard}>

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
                                                        {/* Precios */}
                                                        <div>
                                                            {hasPromo ? (
                                                                <>
                                                                    <p className={productStyles.productCardPrice}>${promoPrice.toLocaleString("es-AR")}</p>
                                                                    <p className={productStyles.productCardPriceOld}>${minPrice.toLocaleString("es-AR")}</p>
                                                                </>
                                                            ) : (
                                                                <p className={productStyles.productCardPrice}>${minPrice.toLocaleString("es-AR")}</p>
                                                            )}
                                                        </div>

                                                        {/* Colores */}
                                                        {product.variants.length > 1 && (
                                                            <div className={productStyles.productCardColors}>
                                                                {product.variants.slice(0, 4).map(variant => {
                                                                    const color = variant.attributeValues?.find(av => av.attributeValue.hexColor)?.attributeValue.hexColor;
                                                                    if (!color) return null;
                                                                    return <div key={variant.id} className={productStyles.productCardColorDot} style={{ backgroundColor: color }} />;
                                                                })}
                                                                {product.variants.length > 4 && (
                                                                    <span className="text-xs text-gray-400">+{product.variants.length - 4}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Footer con info de pagos */}
                                                <div className={productStyles.productCardFooter}>
                                                    <p className={productStyles.productCardTransferPrice}>
                                                        ${(hasPromo ? promoPrice * 0.9 : minPrice * 0.9).toLocaleString("es-AR")} Transferencia
                                                    </p>
                                                    <p className={productStyles.productCardInstallments}>
                                                        3 cuotas sin interés de ${((hasPromo ? promoPrice : minPrice) / 3).toLocaleString("es-AR")}
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(product.variants[0].id);
                                                        }}
                                                        className="w-full mt-3 bg-black text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
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
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
