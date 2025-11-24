import { useState, useEffect } from 'react';
import { attributesService } from '../../api/attributes';
import { productsService } from '../../api/products';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { RefreshCw, Trash2, Plus, Check } from 'lucide-react';

export default function VariantsEditor({ product, onUpdate }) {
    const [attributes, setAttributes] = useState([]);
    const [selectedValues, setSelectedValues] = useState({}); // { attributeId: [valueId1, valueId2] }
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, [product]);

    const loadData = async () => {
        try {
            const attributesData = await attributesService.getAll();
            setAttributes(attributesData);

            console.log('\n🟢 [VARIANTS EDITOR] LoadData');
            console.log('Product:', product.name);
            console.log('Product variants:', product.variants?.length || 0);

            // Cargar variantes existentes
            if (product.variants) {
                setVariants(product.variants);

                // Pre-seleccionar valores basados en variantes existentes
                const existingValues = {};
                product.variants.forEach(variant => {
                    console.log('  Variant:', variant.sku);
                    console.log('  attributeValues:', variant.attributeValues);

                    variant.attributeValues?.forEach(av => {
                        const attrId = av.attributeValue.attribute.id;
                        const valueId = av.attributeValue.id;

                        console.log(`    - ${av.attributeValue.attribute.name}: ${av.attributeValue.value} (attrId: ${attrId}, valueId: ${valueId})`);

                        if (!existingValues[attrId]) {
                            existingValues[attrId] = [];
                        }
                        if (!existingValues[attrId].includes(valueId)) {
                            existingValues[attrId].push(valueId);
                        }
                    });
                });

                console.log('\n📋 Valores pre-seleccionados:', JSON.stringify(existingValues, null, 2));
                setSelectedValues(existingValues);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttributeValue = (attributeId, valueId) => {
        setSelectedValues(prev => {
            const current = prev[attributeId] || [];
            if (current.includes(valueId)) {
                // Remover
                const newValues = current.filter(id => id !== valueId);
                if (newValues.length === 0) {
                    const { [attributeId]: removed, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [attributeId]: newValues };
            } else {
                // Agregar
                return { ...prev, [attributeId]: [...current, valueId] };
            }
        });
    };

    const handleGenerateVariants = async () => {
        const selectedAttrs = Object.keys(selectedValues);
        if (selectedAttrs.length === 0) {
            alert('Selecciona al menos un valor de atributo');
            return;
        }

        const hasEmptyValues = selectedAttrs.some(attrId => selectedValues[attrId].length === 0);
        if (hasEmptyValues) {
            alert('Cada atributo seleccionado debe tener al menos un valor');
            return;
        }

        const totalCombinations = Object.values(selectedValues).reduce((acc, vals) => acc * vals.length, 1);

        // Calcular cuántas combinaciones ya existen
        const existingCombinationsCount = variants.filter(variant => {
            return Object.entries(selectedValues).every(([attrId, valueIds]) => {
                const variantValueForAttr = variant.attributeValues?.find(
                    av => av.attributeValue.attribute.id === parseInt(attrId)
                );
                return variantValueForAttr && valueIds.includes(variantValueForAttr.attributeValue.id);
            });
        }).length;

        const newCombinations = totalCombinations - existingCombinationsCount;

        let message = `Se generarán ${totalCombinations} combinaciones`;
        if (existingCombinationsCount > 0) {
            message += `\n(${existingCombinationsCount} ya existen, se crearán ${newCombinations} nuevas)`;
        }
        message += '\n\n¿Continuar?';

        if (!confirm(message)) {
            return;
        }

        console.log('\n🔵 [GENERATE VARIANTS] Enviando request');
        console.log('deleteExisting: false (manteniendo variantes existentes)');
        console.log('selectedValues:', JSON.stringify(selectedValues, null, 2));

        setGenerating(true);
        try {
            const result = await productsService.generateVariants(product.id, false, selectedValues);
            alert(result.message);
            setVariants(result.variants);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Error al generar variantes: ' + (error.response?.data?.error || error.message));
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateVariant = async (variantId, field, value) => {
        try {
            const updateData = { [field]: value };
            await productsService.updateVariant(product.id, variantId, updateData);

            // Actualizar localmente
            setVariants(prev => prev.map(v =>
                v.id === variantId ? { ...v, [field]: value } : v
            ));
        } catch (error) {
            alert('Error al actualizar variante');
        }
    };

    const handleDeleteVariant = async (variantId) => {
        if (!confirm('¿Eliminar esta variante?')) return;

        try {
            await productsService.deleteVariant(product.id, variantId);
            setVariants(prev => prev.filter(v => v.id !== variantId));
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Error al eliminar variante');
        }
    };

    const formatVariantName = (variant) => {
        if (!variant.attributeValues || variant.attributeValues.length === 0) {
            return variant.sku;
        }

        return variant.attributeValues
            .map(av => `${av.attributeValue.attribute.name}: ${av.attributeValue.value}`)
            .join(' | ');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Selector de Valores de Atributos */}
            <Card>
                <h3 className="text-lg font-semibold text-primary mb-2">
                    Seleccionar Variantes del Producto
                </h3>
                <p className="text-sm text-muted mb-4">
                    Marca los valores específicos que quieres para este producto. Solo se generarán combinaciones de los valores seleccionados.
                </p>

                {attributes.map(attr => {
                    const selectedForThisAttr = selectedValues[attr.id] || [];
                    const hasSelection = selectedForThisAttr.length > 0;

                    // Log para debug
                    if (hasSelection) {
                        console.log(`🔵 Atributo ${attr.name} (id: ${attr.id})`);
                        console.log(`  Selected IDs:`, selectedForThisAttr);
                        console.log(`  Available values:`, attr.values?.map(v => `${v.value}(${v.id})`).join(', '));
                    }

                    return (
                        <div key={attr.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-primary">{attr.name}</h4>
                                    <p className="text-xs text-muted">
                                        {attr.values?.length || 0} opciones disponibles
                                    </p>
                                </div>
                                {hasSelection && (
                                    <span className="text-sm font-medium text-secondary">
                                        {selectedForThisAttr.length} seleccionada(s)
                                    </span>
                                )}
                            </div>

                            {attr.values && attr.values.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map(value => {
                                        const isSelected = selectedForThisAttr.includes(value.id);

                                        // Verificar si este valor ya tiene variantes existentes
                                        const hasExistingVariant = variants.some(variant =>
                                            variant.attributeValues?.some(av =>
                                                av.attributeValue.id === value.id
                                            )
                                        );

                                        return (
                                            <button
                                                key={value.id}
                                                onClick={() => toggleAttributeValue(attr.id, value.id)}
                                                className={`px-3 py-2 rounded-lg border-2 transition-all relative ${isSelected
                                                    ? 'border-secondary bg-secondary text-white shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {value.hexColor && (
                                                        <span
                                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: value.hexColor }}
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium">{value.value}</span>
                                                    {isSelected && <Check className="h-4 w-4" />}
                                                    {hasExistingVariant && !isSelected && (
                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Ya tiene variantes" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {Object.keys(selectedValues).length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 mb-2">
                            <strong>📊 Resumen de selección:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(selectedValues).map(([attrId, valueIds]) => {
                                const attr = attributes.find(a => a.id === parseInt(attrId));
                                return (
                                    <span key={attrId} className="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                                        {attr?.name}: <strong>{valueIds.length} valor(es)</strong>
                                    </span>
                                );
                            })}
                        </div>
                        <p className="text-sm font-semibold text-blue-900">
                            Total de variantes a generar: {Object.values(selectedValues).reduce((acc, vals) => acc * vals.length, 1)}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={handleGenerateVariants}
                        disabled={generating || Object.keys(selectedValues).length === 0}
                        className="flex-1"
                    >
                        <Plus className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generando...' : 'Generar Variantes Seleccionadas'}
                    </Button>
                </div>
            </Card>    {/* Tabla de Variantes Existentes */}
            {
                variants.length > 0 && (
                    <Card>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            3. Editar Variantes ({variants.length})
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Variante
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">
                                            Precio Venta
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">
                                            P. Promoción
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                                            Costo
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                                            Activo
                                        </th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {variants.map(variant => (
                                        <tr key={variant.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                {formatVariantName(variant)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                                {variant.sku}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.salePrice || ''}
                                                    onChange={(e) => handleUpdateVariant(variant.id, 'salePrice', parseFloat(e.target.value))}
                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'salePrice', parseFloat(e.target.value) || null)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-secondary focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.promotionPrice || ''}
                                                    onChange={(e) => handleUpdateVariant(variant.id, 'promotionPrice', parseFloat(e.target.value))}
                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'promotionPrice', parseFloat(e.target.value) || null)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-secondary focus:border-transparent"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.cost || ''}
                                                    onChange={(e) => handleUpdateVariant(variant.id, 'cost', parseFloat(e.target.value))}
                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'cost', parseFloat(e.target.value) || null)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-secondary focus:border-transparent"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={variant.stock?.quantity || 0}
                                                    onChange={(e) => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value))}
                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-secondary focus:border-transparent"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={variant.isActive}
                                                    onChange={(e) => handleUpdateVariant(variant.id, 'isActive', e.target.checked)}
                                                    className="w-4 h-4 text-secondary rounded focus:ring-2 focus:ring-secondary"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDeleteVariant(variant.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )
            }
        </div >
    );
}
