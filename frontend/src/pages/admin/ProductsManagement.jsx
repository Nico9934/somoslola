import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsService } from '../../api/products';
import { categoriesService } from '../../api/categories';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { X } from 'lucide-react';

export default function ProductsManagement() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        categoryId: '',
        brandId: '',
        outOfStock: false
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, categoriesData, brandsData] = await Promise.all([
                productsService.getAll(),
                categoriesService.getAll(),
                api.get('/brands')
            ]);
            // Manejar tanto arrays como objetos con paginación
            setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
            setCategories(categoriesData);
            setBrands(brandsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
            setProducts([]); // Asegurar que products siempre sea un array
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await productsService.delete(id);
            loadData();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const filteredProducts = products.filter(product => {
        // Filtro por búsqueda de texto
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Filtro por categoría
        if (filters.categoryId && product.categoryId !== Number(filters.categoryId)) {
            return false;
        }

        // Filtro por marca
        if (filters.brandId && product.brandId !== Number(filters.brandId)) {
            return false;
        }

        // Filtro por sin stock
        if (filters.outOfStock) {
            const hasStock = product.variants?.some(v => v.stock > 0);
            if (hasStock) return false;
        }

        return true;
    });

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            categoryId: '',
            brandId: '',
            outOfStock: false
        });
    };

    const hasActiveFilters = filters.categoryId || filters.brandId || filters.outOfStock;

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto overflow-x-hidden">
                <AdminPageLayout
                    title="Productos"
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    onCreateClick={() => navigate('/admin/products/new')}
                >
                    {/* Barra de filtros */}
                    <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Filtro por Categoría */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    value={filters.categoryId}
                                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por Marca */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marca
                                </label>
                                <select
                                    value={filters.brandId}
                                    onChange={(e) => handleFilterChange('brandId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                                >
                                    <option value="">Todas las marcas</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro Sin Stock */}
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.outOfStock}
                                        onChange={(e) => handleFilterChange('outOfStock', e.target.checked)}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Solo sin stock</span>
                                </label>
                            </div>

                            {/* Botón Limpiar Filtros */}
                            {hasActiveFilters && (
                                <div>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-4 py-2 text-sm text-gray-700 flex items-center gap-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Contador de resultados */}
                        <div className="mt-3 text-sm text-gray-600">
                            Mostrando <span className="font-semibold">{filteredProducts.length}</span> de {products.length} productos
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredProducts.map((product) => (
                            <Card key={product.id}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-primary">{product.name}</h3>
                                        <p className="text-sm text-muted mb-2">{product.category?.name}</p>
                                        <p className="text-muted mb-2">{product.description}</p>
                                        {product.variants && product.variants.length > 0 && (
                                            <div className="mt-2">
                                                {(() => {
                                                    const hasPromotion = product.variants.some(v => v.promotionPrice);
                                                    const minSalePrice = Math.min(...product.variants.map(v => v.salePrice));
                                                    const maxSalePrice = Math.max(...product.variants.map(v => v.salePrice));
                                                    const minPromoPrice = hasPromotion ? Math.min(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice)) : null;
                                                    const maxPromoPrice = hasPromotion ? Math.max(...product.variants.filter(v => v.promotionPrice).map(v => v.promotionPrice)) : null;

                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            {hasPromotion ? (
                                                                <>
                                                                    {/* Precio original tachado */}
                                                                    <p className="text-md text-gray-400 line-through">
                                                                        ${minSalePrice.toLocaleString()}
                                                                        {product.variants.length > 1 && maxSalePrice !== minSalePrice && ` - $${maxSalePrice.toLocaleString()}`}
                                                                    </p>
                                                                    {/* Precio promocional destacado */}
                                                                    <p className="text-lg font-bold text-red-600">
                                                                        ${minPromoPrice.toLocaleString()}
                                                                        {product.variants.length > 1 && maxPromoPrice !== minPromoPrice && ` - $${maxPromoPrice.toLocaleString()}`}
                                                                    </p>
                                                                    <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">
                                                                        EN PROMO
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                /* Precio normal */
                                                                <p className="text-lg font-bold text-secondary">
                                                                    ${minSalePrice.toLocaleString()}
                                                                    {product.variants.length > 1 && maxSalePrice !== minSalePrice && ` - $${maxSalePrice.toLocaleString()}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Previsualización de Variantes */}
                                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-medium text-gray-500">Variantes:</span>
                                                    {(() => {
                                                        // Agrupar valores de atributos únicos
                                                        const attributesMap = {};

                                                        product.variants.forEach(variant => {
                                                            variant.attributeValues?.forEach(av => {
                                                                const attrName = av.attributeValue.attribute.name;
                                                                const value = av.attributeValue;

                                                                if (!attributesMap[attrName]) {
                                                                    attributesMap[attrName] = [];
                                                                }

                                                                // Evitar duplicados
                                                                if (!attributesMap[attrName].some(v => v.id === value.id)) {
                                                                    attributesMap[attrName].push(value);
                                                                }
                                                            });
                                                        });

                                                        const colorAttr = attributesMap['Color'] || attributesMap['color'];
                                                        const otherAttrs = Object.entries(attributesMap).filter(
                                                            ([name]) => name.toLowerCase() !== 'color'
                                                        );

                                                        return (
                                                            <>
                                                                {/* Círculos de colores */}
                                                                {colorAttr && colorAttr.length > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        {colorAttr.slice(0, 6).map(color => (
                                                                            <div
                                                                                key={color.id}
                                                                                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                                                                style={{ backgroundColor: color.hexColor || '#ccc' }}
                                                                                title={color.value}
                                                                            />
                                                                        ))}
                                                                        {colorAttr.length > 6 && (
                                                                            <span className="text-xs font-medium text-gray-500">
                                                                                +{colorAttr.length - 6}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Badges de otros atributos */}
                                                                {otherAttrs.map(([attrName, values]) => (
                                                                    <div key={attrName} className="flex items-center gap-1">
                                                                        <span className="text-xs font-medium text-gray-500">{attrName}:</span>
                                                                        {values.slice(0, 4).map(value => (
                                                                            <span
                                                                                key={value.id}
                                                                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                                                                            >
                                                                                {value.value}
                                                                            </span>
                                                                        ))}
                                                                        {values.length > 4 && (
                                                                            <span className="text-xs font-medium text-gray-500">
                                                                                +{values.length - 4}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {/* Total de variantes y stock */}
                                                                <span className="text-xs text-gray-400">
                                                                    • {product.variants.length} total
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                    <span className="text-xs text-gray-400">
                                                        • Stock: {product.variants.reduce((sum, v) => sum + (v.stock?.quantity || 0), 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </AdminPageLayout>
            </div>
        </AdminLayout>
    );
}
