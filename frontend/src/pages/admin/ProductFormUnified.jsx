import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsService } from '../../api/products';
import { categoriesService } from '../../api/categories';
import { attributesService } from '../../api/attributes';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

/**
 * 📝 FORMULARIO UNIFICADO DE PRODUCTO
 * 
 * Este componente maneja TODA la creación y edición de productos en una sola pantalla.
 * No hay pasos separados, todo está visible a la vez para facilitar la edición.
 * 
 * FLUJO CREAR:
 * 1. Usuario completa nombre, descripción, categoría
 * 2. Selecciona atributos y valores (Color: Rojo, Azul; Talle: M, L)
 * 3. Click en "Generar Variantes" → se crean automáticamente las combinaciones
 * 4. Usuario configura precio/stock de cada variante en la tabla
 * 5. Click en "Guardar" → se crea el producto con todas sus variantes
 * 
 * FLUJO EDITAR:
 * 1. Se carga el producto existente con todas sus variantes
 * 2. Usuario puede modificar nombre, descripción, categoría
 * 3. Usuario puede modificar precios/stock de variantes existentes
 * 4. Click en "Guardar Cambios" → se actualiza todo
 * 
 * SISTEMA DE SKU:
 * - Se genera automáticamente: PREFIJO-ATRIBUTOS
 * - Ejemplo: "REM-ROJO-M" (Remera, Rojo, M)
 * - Usuario puede editarlo manualmente si lo desea
 */
export default function ProductFormUnified() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    // ============================================================================
    // 📊 ESTADOS DEL COMPONENTE
    // ============================================================================
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

    // 📷 Upload de imágenes por variante (mismo sistema que imágenes generales)
    const handleVariantImageUpload = async (variantIndex, files) => {
        const fileArray = Array.from(files);
        const currentImages = variants[variantIndex].images || [];

        if (currentImages.length + fileArray.length > 5) {
            alert('Máximo 5 imágenes por variante');
            return;
        }

        setUploadingVariantIndex(variantIndex);
        const newImages = [];

        try {
            for (const file of fileArray) {
                const formData = new FormData();
                formData.append('image', file);

                const { data } = await api.post('/upload/product-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                newImages.push({
                    url: data.url,
                    publicId: data.publicId
                });
            }

            const newVariants = [...variants];
            newVariants[variantIndex].images = [...currentImages, ...newImages];
            setVariants(newVariants);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error al subir imágenes: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploadingVariantIndex(null);
        }
    };

    const removeVariantImage = async (variantIndex, imageIndex) => {
        const imageToRemove = variants[variantIndex].images[imageIndex];

        try {
            await api.delete('/upload/delete-image', {
                data: { publicId: imageToRemove.publicId }
            });

            const newVariants = [...variants];
            newVariants[variantIndex].images.splice(imageIndex, 1);
            setVariants(newVariants);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error al eliminar imagen');
        }
    };

    // 📋 Datos básicos del producto
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
    });

    // 🎯 Atributos seleccionados: { attributeId: [valueId1, valueId2, ...] }
    const [selectedValues, setSelectedValues] = useState({});

    // 📦 Variantes del producto (generadas o existentes)
    const [variants, setVariants] = useState([]);

    // ============================================================================
    // 🛠️ FUNCIONES HELPER
    // ============================================================================

    /**
     * Extrae el publicId de una URL de Cloudinary
     */
    const extractPublicId = (url) => {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1]; // abc123.jpg
        const folder = urlParts.slice(-2, -1)[0]; // products
        const parentFolder = urlParts.slice(-3, -2)[0]; // somoslola
        return `${parentFolder}/${folder}/${filename.split('.')[0]}`; // somoslola/products/abc123
    };

    // ============================================================================
    // 🔄 CARGA INICIAL DE DATOS
    // ============================================================================
    const loadInitialData = useCallback(async () => {
        console.log('\n🔵 [UNIFIED FORM] Iniciando carga de datos...');
        setLoading(true);
        try {
            // 1️⃣ Cargar categorías y atributos disponibles
            const [categoriesData, attributesData, brandsData] = await Promise.all([
                categoriesService.getAll(),
                attributesService.getAll(),
                api.get('/brands'),
            ]);
            setCategories(categoriesData);
            setAttributes(attributesData);
            setBrands(brandsData.data);
            console.log('✅ Categorías cargadas:', categoriesData.length);
            console.log('✅ Atributos cargados:', attributesData.length);
            console.log('✅ Marcas cargadas:', brandsData.data.length);

            // 2️⃣ Si estamos EDITANDO, cargar producto existente
            if (id) {
                console.log('\n📝 Modo EDICIÓN - Cargando producto ID:', id);
                const product = await productsService.getById(id);
                console.log('✅ Producto cargado:', product.name);

                // 2.1 Cargar datos básicos
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    categoryId: product.categoryId,
                    brandId: product.brandId || '',
                });

                // 2.2 Cargar variantes existentes
                if (product.variants && product.variants.length > 0) {
                    console.log('📦 Variantes existentes:', product.variants.length);
                    const existingVariants = product.variants.map(v => {
                        console.log('  - SKU:', v.sku, '| Precio:', v.salePrice, '| Stock:', v.stock?.quantity, '| Imágenes:', v.images?.length || 0);

                        // Mapear attributeValues a combination para mantener consistencia
                        const combination = v.attributeValues?.map(av => ({
                            attributeId: av.attributeValue.attribute.id,
                            valueId: av.attributeValue.id,
                            valueName: av.attributeValue.value,
                            hexColor: av.attributeValue.hexColor
                        })) || [];

                        // Mapear imágenes existentes
                        const images = v.images?.map(img => ({
                            url: img.url,
                            publicId: extractPublicId(img.url)
                        })) || [];

                        return {
                            id: v.id, // ⚠️ Importante: guardamos el ID para actualizar
                            sku: v.sku,
                            salePrice: v.salePrice,
                            promotionPrice: v.promotionPrice || '',
                            cost: v.cost || '',
                            stock: v.stock?.quantity || 0,
                            images: images, // ✅ Agregar imágenes
                            combination: combination, // Combinación de atributos
                            isExisting: true // Marcador para saber que ya existe en DB
                        };
                    });
                    setVariants(existingVariants);

                    // NO preseleccionar atributos en modo edición
                    // Esto evita que al generar variantes se dupliquen las existentes
                    console.log('✅ Variantes cargadas sin preseleccionar atributos');
                }
            } else {
                console.log('\n➕ Modo CREACIÓN - Formulario vacío');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // ============================================================================
    // 🏷️ MANEJO DE ATRIBUTOS Y VALORES
    // ============================================================================

    /**
     * Marca/desmarca un valor de atributo
     * Ejemplo: toggleAttributeValue(1, 5) → Color: Rojo
     */
    const toggleAttributeValue = (attributeId, valueId) => {
        console.log(`\n🔄 Toggle valor - Atributo: ${attributeId}, Valor: ${valueId}`);
        setSelectedValues(prev => {
            const current = prev[attributeId] || [];
            if (current.includes(valueId)) {
                // ➖ Remover valor
                const newValues = current.filter(id => id !== valueId);
                if (newValues.length === 0) {
                    // Si no quedan valores, remover el atributo completo
                    const { [attributeId]: _removed, ...rest } = prev;
                    console.log('  Atributo removido completamente');
                    return rest;
                }
                console.log('  Valor removido');
                return { ...prev, [attributeId]: newValues };
            } else {
                // ➕ Agregar valor
                console.log('  Valor agregado');
                return { ...prev, [attributeId]: [...current, valueId] };
            }
        });
    };

    // ============================================================================
    // 📦 GENERACIÓN DE VARIANTES
    // ============================================================================

    /**
     * Genera todas las combinaciones posibles de atributos seleccionados
     * Ejemplo: Color [Rojo, Azul] × Talle [M, L] = 4 variantes
     */
    const handleGenerateVariants = () => {
        console.log('\n🔵 [GENERATE VARIANTS] Iniciando generación...');
        console.log('Valores seleccionados:', JSON.stringify(selectedValues));

        // 1️⃣ Validar que haya valores seleccionados
        const selectedAttrs = Object.keys(selectedValues);
        if (selectedAttrs.length === 0) {
            console.log('⚠️ Sin atributos seleccionados → Crear variante única');
            // Sin atributos: crear UNA SOLA variante básica
            setVariants([{
                sku: generateSimpleSKU(formData.name),
                salePrice: '',
                promotionPrice: '',
                cost: '',
                stock: 0,
                images: [],
                combination: [],
                isExisting: false
            }]);
            return;
        }

        // 2️⃣ Preparar atributos con sus valores seleccionados
        const attrsWithValues = selectedAttrs.map(attrId => {
            const attr = attributes.find(a => a.id === parseInt(attrId));
            const selectedVals = selectedValues[attrId] || [];
            const values = attr.values.filter(v => selectedVals.includes(v.id));
            console.log(`  Atributo: ${attr.name} → ${values.length} valores seleccionados`);
            return { ...attr, values };
        }).filter(attr => attr.values.length > 0);

        if (attrsWithValues.length === 0) {
            alert('Debes seleccionar al menos un valor para cada atributo');
            return;
        }

        // 3️⃣ Generar todas las combinaciones posibles
        const combinations = generateCombinations(attrsWithValues);
        console.log(`✅ ${combinations.length} combinaciones generadas`);

        // 4️⃣ Filtrar combinaciones que ya existen (en modo edición)
        const existingCombinations = variants
            .filter(v => v.isExisting && v.combination && v.combination.length > 0)
            .map(v => v.combination.map(c => c.valueId).sort().join('-'));

        const newCombinations = combinations.filter(combo => {
            const comboKey = combo.map(c => c.valueId).sort().join('-');
            return !existingCombinations.includes(comboKey);
        });

        console.log(`🔍 ${existingCombinations.length} combinaciones ya existen`);
        console.log(`➕ ${newCombinations.length} combinaciones nuevas a crear`);

        if (newCombinations.length === 0) {
            alert('Todas las combinaciones seleccionadas ya existen');
            setSelectedValues({});
            return;
        }

        // 5️⃣ Crear variantes SOLO para combinaciones nuevas
        const newVariants = newCombinations.map((combo, index) => {
            const sku = generateSKU(formData.name, combo);
            console.log(`  ${index + 1}. SKU: ${sku} | Combo:`, combo.map(c => c.valueName).join(', '));

            return {
                sku,
                salePrice: '',
                promotionPrice: '',
                cost: '',
                stock: 0,
                images: [],
                combination: combo,
                isExisting: false
            };
        });

        // 🔄 AGREGAR nuevas variantes a las existentes (no reemplazar)
        console.log(`📋 Variantes existentes: ${variants.length}`);
        console.log(`➕ Nuevas variantes: ${newVariants.length}`);
        setVariants([...variants, ...newVariants]);
        console.log('✅ Variantes agregadas correctamente');

        // 6️⃣ Limpiar selección de atributos para evitar confusión
        console.log('🧹 Limpiando selección de atributos...');
        setSelectedValues({});
    };

    /**
     * Genera combinaciones recursivamente
     * Ejemplo: [Color: [Rojo, Azul], Talle: [M, L]]
     * Resultado: [[Rojo, M], [Rojo, L], [Azul, M], [Azul, L]]
     */
    const generateCombinations = (attrs) => {
        if (attrs.length === 0) return [[]];

        const [first, ...rest] = attrs;
        const restCombinations = generateCombinations(rest);
        const combinations = [];

        for (const value of first.values) {
            for (const combo of restCombinations) {
                combinations.push([
                    {
                        attributeId: first.id,
                        valueId: value.id,
                        attributeName: first.name,
                        valueName: value.value,
                        hexColor: value.hexColor
                    },
                    ...combo
                ]);
            }
        }

        return combinations;
    };

    /**
     * Genera SKU basado en producto y combinación de atributos
     * Formato: PREFIJO-ATTR1-ATTR2-ATTR3
     * Ejemplo: "REM-ROJO-M" (Remera Rojo Talle M)
     */
    const generateSKU = (productName, combination) => {
        // Prefijo: primeras 3 letras del producto en mayúsculas
        const prefix = productName
            .substring(0, 3)
            .toUpperCase()
            .replace(/\s/g, '');

        // Atributos: primeras 3-4 letras de cada valor
        const attrs = combination
            .map(c => c.valueName.substring(0, 4).toUpperCase())
            .join('-');

        const sku = attrs ? `${prefix}-${attrs}` : `${prefix}-001`;
        console.log(`  🏷️ SKU generado: ${sku}`);
        return sku;
    };

    /**
     * Genera SKU simple para productos sin variantes
     */
    const generateSimpleSKU = (productName) => {
        const prefix = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');
        return `${prefix}-001`;
    };

    // ============================================================================
    // ✏️ ACTUALIZACIÓN DE VARIANTES
    // ============================================================================

    /**
     * Actualiza un campo de una variante específica
     */
    const updateVariant = (index, field, value) => {
        console.log(`\n✏️ Actualizar variante ${index} → ${field} = ${value}`);
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    /**
     * Agrega una variante manual vacía
     */
    const addManualVariant = () => {
        console.log('\n➕ Agregar variante manual');
        setVariants([...variants, {
            sku: '',
            salePrice: '',
            promotionPrice: '',
            cost: '',
            stock: 0,
            images: [],
            combination: [],
            isExisting: false
        }]);
    };

    /**
     * Elimina una variante
     */
    const removeVariant = (index) => {
        console.log(`\n🗑️ Eliminar variante ${index}`);
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        } else {
            alert('Debe haber al menos una variante');
        }
    };

    // ============================================================================
    // 💾 GUARDAR PRODUCTO
    // ============================================================================

    const handleSubmit = async () => {
        console.log('\n💾 [SAVE] Iniciando guardado de producto...');

        // 1️⃣ Validar datos básicos
        if (!formData.name || !formData.categoryId) {
            alert('Por favor completa nombre y categoría');
            return;
        }

        // 2️⃣ Validar variantes
        if (variants.length === 0) {
            alert('Debes generar al menos una variante');
            return;
        }

        const invalidVariants = variants.filter(v => !v.sku.trim() || !v.salePrice);
        if (invalidVariants.length > 0) {
            alert('Cada variante debe tener SKU y precio de venta');
            return;
        }

        // Validar que precio promocional sea menor que precio de lista
        const invalidPromoVariants = variants.filter(v =>
            v.promotionPrice && parseFloat(v.promotionPrice) >= parseFloat(v.salePrice)
        );
        if (invalidPromoVariants.length > 0) {
            alert('El precio promocional debe ser menor al precio de lista');
            return;
        }

        console.log('✅ Validaciones pasadas');
        console.log('  Producto:', formData.name);
        console.log('  Categoría ID:', formData.categoryId);
        console.log('  Variantes:', variants.length);

        try {
            if (isEditing) {
                console.log('\n📝 Modo EDICIÓN - Actualizando producto...');

                // 1. Actualizar datos básicos del producto
                await productsService.update(id, {
                    name: formData.name,
                    description: formData.description,
                    categoryId: parseInt(formData.categoryId),
                    brandId: formData.brandId ? parseInt(formData.brandId) : null,
                });
                console.log('✅ Datos básicos actualizados');

                // 2. Procesar variantes: actualizar existentes y crear nuevas
                for (const variant of variants) {
                    if (variant.isExisting && variant.id) {
                        // Actualizar variante existente
                        console.log(`  Actualizando variante ID ${variant.id}: ${variant.sku} - ${variant.images?.length || 0} imágenes`);
                        await productsService.updateVariant(id, variant.id, {
                            salePrice: parseFloat(variant.salePrice),
                            promotionPrice: variant.promotionPrice ? parseFloat(variant.promotionPrice) : null,
                            cost: variant.cost ? parseFloat(variant.cost) : null,
                            stock: parseInt(variant.stock) || 0,
                            images: variant.images || [],
                            isActive: true
                        });
                        console.log('    ✅ Actualizada');
                    } else {
                        // Crear variante nueva
                        console.log(`  Creando variante nueva: ${variant.sku} - ${variant.images?.length || 0} imágenes`);
                        await productsService.createVariant(id, {
                            sku: variant.sku,
                            salePrice: parseFloat(variant.salePrice),
                            promotionPrice: variant.promotionPrice ? parseFloat(variant.promotionPrice) : null,
                            cost: variant.cost ? parseFloat(variant.cost) : null,
                            stock: parseInt(variant.stock) || 0,
                            images: variant.images || [],
                            combination: variant.combination || []
                        });
                        console.log('    ✅ Creada');
                    }
                }

                console.log('✅ Producto actualizado exitosamente');
            } else {
                console.log('\n➕ Modo CREACIÓN - Creando producto...');
                console.log('📊 Estado de variantes antes de enviar:');
                variants.forEach((v, i) => {
                    console.log(`  V${i} ${v.sku}:`);
                    console.log(`    Images array length: ${v.images?.length || 0}`);
                    if (v.images && v.images.length > 0) {
                        v.images.forEach((img, j) => {
                            console.log(`      ${j + 1}. ${img.url?.substring(0, 50)}...`);
                        });
                    }
                });

                // Crear producto nuevo con todas sus variantes
                const data = {
                    name: formData.name,
                    description: formData.description,
                    categoryId: parseInt(formData.categoryId),
                    brandId: formData.brandId ? parseInt(formData.brandId) : null,
                    variants: variants.map((v, i) => {
                        console.log(`  Enviando ${i + 1}. ${v.sku} - $${v.salePrice} - ${v.images?.length || 0} imágenes`);
                        return {
                            sku: v.sku,
                            salePrice: parseFloat(v.salePrice),
                            promotionPrice: v.promotionPrice ? parseFloat(v.promotionPrice) : null,
                            cost: v.cost ? parseFloat(v.cost) : null,
                            stock: parseInt(v.stock) || 0,
                            // Enviar las imágenes de la variante
                            images: v.images || [],
                            // Enviar las combinaciones de atributos si existen
                            combination: v.combination || []
                        };
                    })
                };

                const created = await productsService.create(data);
                console.log('✅ Producto creado exitosamente - ID:', created.id);

                // Si hay variantes con atributos, solo asignar los atributos al producto
                // Las variantes ya fueron creadas en el paso anterior
                if (variants.some(v => v.combination && v.combination.length > 0)) {
                    console.log('\n🏷️ Asignando atributos al producto...');
                    const attributeIds = [...new Set(
                        variants
                            .flatMap(v => v.combination || [])
                            .map(c => c.attributeId)
                    )];
                    console.log('  Atributos únicos:', attributeIds);

                    // Solo asignar atributos al producto, NO generar variantes de nuevo
                    await productsService.assignAttributes(created.id, attributeIds);
                    console.log('✅ Atributos asignados al producto');
                }
            }

            navigate('/admin/products');
        } catch (error) {
            console.error('❌ Error al guardar producto:', error);
            alert('Error al guardar producto: ' + (error.response?.data?.error || error.message));
        }
    };

    // ============================================================================
    // 🎨 RENDER
    // ============================================================================

    if (loading) {
        return (
            <AdminLayout>
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header Skeleton */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-9 w-64 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
                    </div>

                    {/* Form Skeleton */}
                    <div className="space-y-6">
                        {/* Card 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-10 w-full bg-gray-100 animate-pulse rounded"></div>
                                <div className="h-24 w-full bg-gray-100 animate-pulse rounded"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                                    <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
                                <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
                                <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
                            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-primary">
                        {isEditing ? '📝 Editar Producto' : '➕ Nuevo Producto'}
                    </h1>
                    <Button variant="outline" onClick={() => navigate('/admin/products')}>
                        ← Volver
                    </Button>
                </div>

                {/* Formulario Unificado */}
                <div className="space-y-6">
                    {/* ========== SECCIÓN 1: DATOS BÁSICOS ========== */}
                    <Card>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Información del Producto
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ej: Remera Oversize Premium"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe las características del producto..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marca (opcional)
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.brandId}
                                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                >
                                    <option value="">Sin marca</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* ========== SECCIÓN 2: ATRIBUTOS Y VARIANTES ========== */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                                🎯 Atributos del Producto
                            </h2>
                            <Button
                                onClick={handleGenerateVariants}
                            >
                                Generar Variantes
                            </Button>
                        </div>                            {/* Lista de atributos con sus valores */}
                        <div className="space-y-4">
                            {attributes.map(attr => {
                                const selectedVals = selectedValues[attr.id] || [];
                                const hasSelection = selectedVals.length > 0;

                                return (
                                    <div key={attr.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-primary">
                                                {attr.name}
                                            </h3>
                                            {hasSelection && (
                                                <span className="text-sm font-semibold text-secondary">
                                                    {selectedVals.length} seleccionado(s)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values?.map(val => {
                                                const isSelected = selectedVals.includes(val.id);
                                                // Si tiene hexColor, es un atributo de color - mostrar solo círculo
                                                const isColorAttribute = !!val.hexColor;

                                                return (
                                                    <button
                                                        key={val.id}
                                                        type="button"
                                                        onClick={() => toggleAttributeValue(attr.id, val.id)}
                                                        className={`${isColorAttribute
                                                            ? 'w-10 h-10 rounded-full border-4 transition-all hover:scale-110'
                                                            : 'px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2'
                                                            } ${isSelected
                                                                ? isColorAttribute
                                                                    ? 'border-secondary ring-2 ring-secondary/30 scale-110'
                                                                    : 'border-secondary bg-secondary text-white font-semibold'
                                                                : isColorAttribute
                                                                    ? 'border-gray-300 hover:border-secondary/50'
                                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-secondary/50'
                                                            }`}
                                                        style={isColorAttribute ? { backgroundColor: val.hexColor } : {}}
                                                        title={val.value}
                                                    >
                                                        {!isColorAttribute && val.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* ========== SECCIÓN 3: TABLA DE VARIANTES ========== */}
                    {variants.length > 0 && (
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                                        📦 Variantes ({variants.length})
                                    </h2>
                                    <p className="text-sm text-muted mt-1">
                                        Configura el precio y stock de cada variante
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addManualVariant}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Agregar Variante
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {variants.some(v => v.combination && v.combination.length > 0) && (
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                                    Combinación
                                                </th>
                                            )}
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">SKU *</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Stock</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Precio Venta *</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">P. Promoción</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Costo</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Margen</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Imágenes</th>
                                            {!isEditing && (
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Acciones</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant, index) => {
                                            // Calcular margen de ganancia
                                            const sale = parseFloat(variant.salePrice);
                                            const cost = parseFloat(variant.cost);
                                            const margin = (sale && cost) ? (((sale - cost) / cost) * 100).toFixed(1) : '-';

                                            return (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    {variants.some(v => v.combination && v.combination.length > 0) && (
                                                        <td className="px-4 py-3">
                                                            {variant.combination && variant.combination.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {variant.combination.map((combo, i) => {
                                                                        // Si tiene hexColor, mostrar círculo de color grande
                                                                        if (combo.hexColor) {
                                                                            return (
                                                                                <span
                                                                                    key={i}
                                                                                    className="inline-block w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                                                                                    style={{ backgroundColor: combo.hexColor }}
                                                                                    title={combo.valueName}
                                                                                ></span>
                                                                            );
                                                                        }
                                                                        // Si no tiene color, mostrar badge normal
                                                                        return (
                                                                            <span key={i} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded font-medium">
                                                                                {combo.valueName}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Sin atributos</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            required
                                                            placeholder="SKU-001"
                                                            disabled={variant.isExisting}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-28 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                                                            value={variant.salePrice}
                                                            onChange={(e) => updateVariant(index, 'salePrice', e.target.value)}
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className={`w-28 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${variant.promotionPrice && parseFloat(variant.promotionPrice) >= parseFloat(variant.salePrice)
                                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                                    : 'border-gray-300 focus:ring-secondary'
                                                                }`}
                                                            value={variant.promotionPrice}
                                                            onChange={(e) => updateVariant(index, 'promotionPrice', e.target.value)}
                                                            placeholder="Opcional"
                                                        />
                                                        {variant.promotionPrice && parseFloat(variant.promotionPrice) >= parseFloat(variant.salePrice) && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                Debe ser menor al precio de lista
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-28 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                                                            value={variant.cost}
                                                            onChange={(e) => updateVariant(index, 'cost', e.target.value)}
                                                            placeholder="Opcional"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-semibold ${margin !== '-' && parseFloat(margin) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {margin !== '-' ? `${margin}%` : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {/* Contenedor horizontal: dropzone + imágenes */}
                                                        <div className="flex items-start gap-3 min-w-[200px]">
                                                            {/* Dropzone cuadrado */}
                                                            <div
                                                                className="w-16 h-16 border-2 border-dashed border-secondary rounded-lg 
                                                                           flex flex-col items-center justify-center text-secondary 
                                                                           text-[10px] cursor-pointer hover:bg-secondary/10 transition-all
                                                                           flex-shrink-0"
                                                                onClick={() => document.getElementById(`variant-file-${index}`).click()}
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => {
                                                                    e.preventDefault();
                                                                    const files = e.dataTransfer.files;
                                                                    if (files.length > 0) {
                                                                        handleVariantImageUpload(index, files);
                                                                    }
                                                                }}
                                                            >
                                                                <input
                                                                    id={`variant-file-${index}`}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    className="hidden"
                                                                    disabled={uploadingVariantIndex === index}
                                                                    onChange={(e) => handleVariantImageUpload(index, e.target.files)}
                                                                />

                                                                {uploadingVariantIndex === index ? (
                                                                    <span className="animate-spin text-lg">⌛</span>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-2xl leading-none font-light">+</span>
                                                                        <span className="text-[9px] opacity-60 mt-1">
                                                                            {variant.images?.length || 0}/5
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Previews de imágenes con scroll horizontal */}
                                                            {variant.images && variant.images.length > 0 && (
                                                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-w-[300px]">
                                                                    {variant.images.map((img, imgIdx) => (
                                                                        <div key={imgIdx} className="relative group flex-shrink-0">
                                                                            <img
                                                                                src={img.url}
                                                                                alt={`Img ${imgIdx + 1}`}
                                                                                className="w-16 h-16 object-contain rounded-lg border-2 border-gray-200 hover:border-secondary transition-colors shadow-sm"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeVariantImage(index, imgIdx)}
                                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                                                                                title="Eliminar imagen"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => removeVariant(index)}
                                                            disabled={variant.isExisting || variants.length === 1}
                                                            title={variant.isExisting ? "No se puede eliminar variante existente" : "Eliminar variante"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-xs text-muted mt-4">
                                💡 Los campos marcados con * son obligatorios. El margen se calcula automáticamente: (Precio Venta - Costo) / Costo × 100
                            </p>
                        </Card>
                    )}

                    {/* ========== BOTONES DE ACCIÓN ========== */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/products')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            size="lg"
                            disabled={variants.length === 0}
                        >
                            {isEditing ? '✓ Guardar Cambios' : '✓ Crear Producto'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
