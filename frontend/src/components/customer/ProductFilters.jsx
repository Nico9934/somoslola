import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { text, buttons, inputs, cards } from '../../styles';

export default function ProductFilters({
    categories,
    brands,
    selectedFilters,
    onFilterChange,
    onClearFilters,
    productCount
}) {
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        price: true
    });

    const MIN_PRICE = 10000;
    const MAX_PRICE = 100000;
    const STEP = 5000;

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryChange = (categoryId) => {
        onFilterChange('categoryId',
            selectedFilters.categoryId === categoryId ? null : categoryId
        );
    };

    const handleBrandChange = (brandId) => {
        onFilterChange('brandId',
            selectedFilters.brandId === brandId ? null : brandId
        );
    };

    const handlePriceChange = (type, value) => {
        const newRange = {
            min: type === 'min' ? Number(value) : (selectedFilters.priceRange?.min || MIN_PRICE),
            max: type === 'max' ? Number(value) : (selectedFilters.priceRange?.max || MAX_PRICE)
        };

        // Asegurar que min no sea mayor que max
        if (newRange.min > newRange.max) {
            if (type === 'min') newRange.max = newRange.min;
            else newRange.min = newRange.max;
        }

        onFilterChange('priceRange', newRange);
    };

    const handleClearPrice = () => {
        onFilterChange('priceRange', null);
    };

    const hasActiveFilters = selectedFilters.categoryId || selectedFilters.brandId || selectedFilters.priceRange;

    const formatPrice = (price) => {
        return `$${(price / 1000).toFixed(0)}k`;
    };

    return (
        <div className={`${cards.bordered} w-full lg:w-64 sticky top-32 max-h-[calc(100vh-150px)] overflow-y-auto`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className={text.sectionTitle}>Filtros</h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className={`${buttons.link} text-sm flex items-center gap-1`}
                    >
                        <X className="w-4 h-4" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Resultados */}
            <div className="mb-6 pb-6 border-b">
                <p className={text.muted}>
                    <span className="font-semibold text-gray-800">{productCount}</span> productos encontrados
                </p>
            </div>

            {/* Categorías */}
            <div className="mb-6 pb-6 border-b">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex justify-between items-center w-full mb-3"
                >
                    <h3 className={text.label}>CATEGORÍAS</h3>
                    {expandedSections.categories ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>

                {expandedSections.categories && (
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center cursor-pointer group"
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.categoryId === category.id}
                                    onChange={(e) => e.stopPropagation()}
                                    className={inputs.checkbox}
                                />
                                <span className={`ml-3 ${text.muted} group-hover:text-black transition`}>
                                    {category.name}
                                </span>
                            </div>

                        ))}
                    </div>
                )}
            </div>

            {/* Marcas */}
            {brands && brands.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                    <button
                        onClick={() => toggleSection('brands')}
                        className="flex justify-between items-center w-full mb-3"
                    >
                        <h3 className={text.label}>MARCAS</h3>
                        {expandedSections.brands ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {expandedSections.brands && (
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <label
                                    key={brand.id}
                                    className="flex items-center cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.brandId === brand.id}
                                        onChange={() => handleBrandChange(brand.id)}
                                        className={inputs.checkbox}
                                    />
                                    <span className={`ml-3 ${text.muted} group-hover:text-black transition`}>
                                        {brand.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rango de Precio */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex justify-between items-center w-full mb-3"
                >
                    <h3 className={text.label}>PRECIO</h3>
                    {expandedSections.price ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>

                {expandedSections.price && (
                    <div className="space-y-4">
                        {/* Valores seleccionados */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700">
                                {formatPrice(selectedFilters.priceRange?.min || MIN_PRICE)}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className="font-medium text-gray-700">
                                {formatPrice(selectedFilters.priceRange?.max || MAX_PRICE)}
                            </span>
                        </div>

                        {/* Slider Mínimo */}
                        <div>
                            <label className={`block mb-2 ${text.muted}`}>Precio Mínimo</label>
                            <input
                                type="range"
                                min={MIN_PRICE}
                                max={MAX_PRICE}
                                step={STEP}
                                value={selectedFilters.priceRange?.min || MIN_PRICE}
                                onChange={(e) => handlePriceChange('min', e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Slider Máximo */}
                        <div>
                            <label className={`block mb-2 ${text.muted}`}>Precio Máximo</label>
                            <input
                                type="range"
                                min={MIN_PRICE}
                                max={MAX_PRICE}
                                step={STEP}
                                value={selectedFilters.priceRange?.max || MAX_PRICE}
                                onChange={(e) => handlePriceChange('max', e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Botón limpiar */}
                        {selectedFilters.priceRange && (
                            <button
                                onClick={handleClearPrice}
                                className={`${buttons.link} text-sm`}
                            >
                                Limpiar precio
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
