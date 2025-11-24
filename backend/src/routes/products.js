import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos y sus variantes
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene todos los productos con variantes y categoría
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (_, res) => {
    console.log('\n📋 GET /products - Listar todos los productos');
    const products = await prisma.product.findMany({
        include: {
            variants: {
                include: {
                    images: true, // Imágenes de cada variante
                    stock: true,
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            },
            category: true,
            attributes: {
                include: {
                    attribute: {
                        include: {
                            values: true
                        }
                    }
                }
            }
        },
    });
    console.log(`✅ Retornando ${products.length} productos`);

    // Debug: verificar imágenes
    products.forEach(p => {
        const totalImages = p.variants.reduce((sum, v) => sum + (v.images?.length || 0), 0);
        console.log(`   📦 [ID:${p.id}] ${p.name}: ${p.variants.length} variantes, ${totalImages} imágenes totales`);
        if (totalImages === 0 && p.variants.length > 0) {
            p.variants.forEach((v, i) => {
                console.log(`      V${i} (ID:${v.id}): images array length = ${v.images?.length || 0}`);
            });
        }
    });

    res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    console.log(`\n🔍 GET /products/${id} - Obtener producto por ID`);
    console.log('  Buscando en base de datos...');

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: {
                include: {
                    images: true, // Imágenes de cada variante
                    stock: true,
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            },
            category: true,
            attributes: {
                include: {
                    attribute: {
                        include: {
                            values: true
                        }
                    }
                }
            }
        },
    });

    if (!product) {
        console.log('❌ Producto no encontrado');
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.log(`✅ Producto encontrado: ${product.name}`);
    console.log(`   Imágenes: ${product.images?.length || 0}`);
    console.log(`   Variantes: ${product.variants?.length || 0}`);
    console.log(`   Atributos asignados: ${product.attributes?.length || 0}`);
    res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto con variantes (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - basePrice
 *               - categoryId
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [sku, stock]
 *                   properties:
 *                     sku:
 *                       type: string
 *                     stock:
 *                       type: integer
 *                     cost:
 *                       type: number
 *                       nullable: true
 *     responses:
 *       200:
 *         description: Producto creado correctamente
 *       400:
 *         description: Debe incluir al menos una variante
 *       401:
 *         description: No autorizado / token faltante
 */
router.post("/", authMiddleware, adminOnly, async (req, res) => {
    console.log('\\n➕ POST /products - Crear nuevo producto');
    const { name, description, categoryId, variants, images } = req.body;
    console.log('Datos recibidos:', { name, categoryId, variantsCount: variants?.length || 0, imagesCount: images?.length || 0 });

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        console.log('❌ Validación fallida: sin variantes');
        return res
            .status(400)
            .json({ error: "Debes agregar al menos una variante" });
    }

    // Validar que todas las variantes tengan salePrice
    const invalidVariants = variants.filter(v => !v.salePrice || v.salePrice <= 0);
    if (invalidVariants.length > 0) {
        console.log('❌ Validación fallida: variantes sin precio válido');
        return res
            .status(400)
            .json({ error: "Todas las variantes deben tener un precio de venta válido" });
    }
    console.log(`✅ Validaciones pasadas. Creando producto con ${variants.length} variantes...`);

    // Debug: ver imágenes recibidas
    variants.forEach((v, i) => {
        console.log("\n=======================================");
        console.log(`VARIANTE ${i} - SKU: ${v.sku}`);
        console.log("IMÁGENES RECIBIDAS EN BODY:", JSON.stringify(v.images, null, 2));
        console.log("=======================================\n");

        console.log(`  Cantidad: ${v.images?.length || 0}`);
    });

    // Debug: ver imágenes recibidas
    variants.forEach((v, i) => {
        console.log(`  V${i} (${v.sku}): ${v.images?.length || 0} imágenes`);
        if (v.images && v.images.length > 0) {
            v.images.forEach((img, j) => {
                console.log(`    ${j + 1}. ${img.url?.substring(0, 60)}...`);
            });
        }
    });

    const product = await prisma.product.create({
        data: {
            name,
            description,
            categoryId: Number(categoryId),
            variants: {
                create: variants.map((v) => ({
                    sku: v.sku,
                    salePrice: Number(v.salePrice),
                    promotionPrice: v.promotionPrice ? Number(v.promotionPrice) : null,
                    cost: v.cost ? Number(v.cost) : null,
                    // Crear imágenes de la variante si existen
                    images: v.images && v.images.length > 0 ? {
                        create: v.images.map(img => ({ url: img.url }))
                    } : undefined,
                    stock: {
                        create: {
                            quantity: v.stock ?? 0,
                            reservedQty: 0,
                        }
                    },
                    // Crear las relaciones con los atributos si existen
                    attributeValues: v.combination && v.combination.length > 0 ? {
                        create: v.combination.map(combo => ({
                            attributeId: combo.attributeId,
                            attributeValueId: combo.valueId
                        }))
                    } : undefined
                })),
            },
        },
        include: {
            variants: {
                include: {
                    images: true,
                    stock: true,
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            },
            category: true
        },
    });

    console.log(`✅ Producto creado exitosamente: ${product.name} (ID: ${product.id})`);
    console.log(`   ${product.variants.length} variantes creadas`);

    res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza información básica de un producto (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: No autorizado
 */
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
        const id = Number(req.params.id);
        console.log(`\n✏️ PUT /products/${id} - Actualizar producto`);
        const { name, description, categoryId } = req.body;
        console.log('  Datos recibidos:', { name, description, categoryId });

        // Solo actualiza campos básicos del producto
        // Para actualizar variantes e imágenes, usar endpoints específicos de variantes
        console.log('  📝 Preparando datos de actualización...');
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (categoryId !== undefined) updateData.categoryId = categoryId;

        console.log('  Campos a actualizar:', Object.keys(updateData));
        console.log('  💾 Guardando cambios en base de datos...');

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                images: true,
                variants: {
                    include: {
                        stock: true,
                        attributeValues: {
                            include: {
                                attributeValue: {
                                    include: {
                                        attribute: true
                                    }
                                }
                            }
                        }
                    }
                },
                category: true,
                attributes: {
                    include: {
                        attribute: {
                            include: {
                                values: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`✅ Producto actualizado: ${product.name}`);
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
    const id = Number(req.params.id);
    console.log(`\\n🗑️ DELETE /products/${id} - Eliminar producto`);

    await prisma.product.delete({
        where: { id },
    });

    console.log('✅ Producto eliminado correctamente');
    res.json({ message: "Producto eliminado" });
});

// ==================== PRODUCT ATTRIBUTES ====================

/**
 * @swagger
 * /products/{id}/attributes:
 *   post:
 *     summary: Asignar atributos a un producto (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attributeIds
 *             properties:
 *               attributeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Atributos asignados correctamente
 */
router.post("/:id/attributes", authMiddleware, adminOnly, async (req, res) => {
    const productId = Number(req.params.id);
    const { attributeIds } = req.body;

    console.log(`\n🏷️ POST /products/${productId}/attributes - Asignar atributos`);
    console.log('  AttributeIds recibidos:', attributeIds);

    if (!Array.isArray(attributeIds)) {
        console.log('  ❌ Error: attributeIds no es un array');
        return res.status(400).json({ error: 'attributeIds debe ser un array' });
    }

    // Eliminar atributos existentes
    console.log('  🗑️  Eliminando asignaciones previas...');
    const deleted = await prisma.productAttribute.deleteMany({
        where: { productId }
    });
    console.log(`  Eliminadas ${deleted.count} asignaciones previas`);

    // Crear nuevas asignaciones
    if (attributeIds.length > 0) {
        console.log(`  ➕ Creando ${attributeIds.length} nuevas asignaciones...`);
        await prisma.productAttribute.createMany({
            data: attributeIds.map(attributeId => ({
                productId,
                attributeId: Number(attributeId)
            }))
        });
    }

    console.log('  📦 Recargando producto con atributos actualizados...');
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            attributes: {
                include: {
                    attribute: {
                        include: {
                            values: true
                        }
                    }
                }
            }
        }
    });

    console.log(`  ✅ Atributos asignados exitosamente: ${product.attributes.length} atributos`);
    product.attributes.forEach(pa => {
        console.log(`     - ${pa.attribute.name} (${pa.attribute.values.length} valores)`);
    });

    res.json(product);
});

// ==================== VARIANT GENERATION ====================

/**
 * @swagger
 * /products/{id}/variants/generate:
 *   post:
 *     summary: Generar variantes automáticamente basado en atributos (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deleteExisting:
 *                 type: boolean
 *                 description: Eliminar variantes existentes
 *                 default: false
 *     responses:
 *       200:
 *         description: Variantes generadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 generated:
 *                   type: integer
 *                 variants:
 *                   type: array
 */
router.post("/:id/variants/generate", authMiddleware, adminOnly, async (req, res) => {
    const productId = Number(req.params.id);
    const { deleteExisting, selectedValues } = req.body; // selectedValues: { attributeId: [valueId1, valueId2] }

    console.log('\n🔵 [GENERATE VARIANTS] Inicio');
    console.log('Product ID:', productId);
    console.log('deleteExisting:', deleteExisting);
    console.log('selectedValues:', JSON.stringify(selectedValues, null, 2));

    try {
        // Obtener producto con atributos
        console.log('  📦 Step 1: Obteniendo producto con atributos...');
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                attributes: {
                    include: {
                        attribute: {
                            include: {
                                values: {
                                    where: { isActive: true },
                                    orderBy: { sortOrder: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!product) {
            console.log('  ❌ Producto no encontrado');
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        console.log(`  ✅ Producto encontrado: ${product.name}`);
        console.log(`  Atributos asignados actualmente: ${product.attributes.length}`);

        // Si se proporcionaron valores seleccionados, asignar automáticamente los atributos al producto
        if (selectedValues && Object.keys(selectedValues).length > 0) {
            console.log('\n  🏷️ Step 2: Asignando atributos automáticamente...');
            const selectedAttributeIds = Object.keys(selectedValues).map(id => parseInt(id));

            // Asignar atributos al producto si no están ya asignados
            for (const attrId of selectedAttributeIds) {
                const existingAssignment = product.attributes.find(pa => pa.attributeId === attrId);

                if (!existingAssignment) {
                    console.log(`     ➕ Asignando atributo ID ${attrId} al producto...`);
                    await prisma.productAttribute.create({
                        data: {
                            productId: productId,
                            attributeId: attrId
                        }
                    });
                } else {
                    console.log(`     ✓ Atributo ID ${attrId} ya estaba asignado`);
                }
            }

            // Recargar producto con atributos actualizados
            console.log('     📦 Recargando producto con atributos actualizados...');
            const updatedProduct = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    attributes: {
                        include: {
                            attribute: {
                                include: {
                                    values: {
                                        where: { isActive: true },
                                        orderBy: { sortOrder: 'asc' }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            product.attributes = updatedProduct.attributes;
            console.log(`     ✅ Producto recargado. Total atributos: ${product.attributes.length}`);
        }

        console.log('\n  🔍 Step 3: Validando atributos del producto...');
        if (product.attributes.length === 0) {
            console.log('  ❌ El producto no tiene atributos asignados');
            return res.status(400).json({ error: 'El producto no tiene atributos asignados. Selecciona valores para generar variantes.' });
        }

        // Filtrar solo los valores seleccionados (si se proporcionan)
        console.log('\n  🎯 Step 4: Filtrando valores para generar combinaciones...');
        const attributesWithValues = product.attributes.map(pa => {
            const attribute = pa.attribute;
            let values = attribute.values;

            // Si se enviaron valores específicos, filtrar
            if (selectedValues && selectedValues[attribute.id]) {
                const beforeFilter = values.length;
                values = values.filter(v => selectedValues[attribute.id].includes(v.id));
                console.log(`     ${attribute.name}: ${beforeFilter} disponibles -> ${values.length} seleccionados`);
                console.log(`       Valores: ${values.map(v => v.value).join(', ')}`);
            } else {
                console.log(`     ${attribute.name}: ${values.length} valores (todos)`);
            }

            return {
                attributeId: attribute.id,
                attributeName: attribute.name,
                values: values
            };
        }).filter(attr => attr.values.length > 0); // Solo atributos con valores

        if (attributesWithValues.length === 0) {
            console.log('  ❌ No hay valores seleccionados para generar variantes');
            return res.status(400).json({ error: 'No hay valores seleccionados para generar variantes' });
        }

        console.log(`  ✅ Atributos con valores seleccionados: ${attributesWithValues.length}`);

        console.log('\n  🔢 Step 5: Generando combinaciones...');
        const combinations = generateCombinations(attributesWithValues);

        console.log(`\n  📊 Total combinaciones calculadas: ${combinations.length}`);
        console.log('Primera combinación:', JSON.stringify(combinations[0], null, 2));

        console.log('\n  🔄 Step 6: Gestionando variantes existentes...');

        // Obtener todas las variantes existentes con sus atributos
        const existingVariants = await prisma.productVariant.findMany({
            where: { productId },
            include: {
                attributeValues: {
                    include: {
                        attributeValue: true
                    }
                }
            }
        });

        console.log(`  📋 Variantes existentes: ${existingVariants.length}`);

        if (deleteExisting) {
            console.log('  🗑️  Modo: ELIMINAR variantes existentes');
            const deleted = await prisma.productVariant.deleteMany({
                where: { productId }
            });
            console.log(`  Eliminadas: ${deleted.count} variantes`);
        } else {
            console.log('  ✅ Modo: MANTENER variantes existentes (solo crear nuevas combinaciones)');
        }

        // Crear nuevas variantes
        console.log('\n  🔨 Step 7: Creando nuevas variantes...');

        // Función para verificar si una combinación ya existe
        const variantExists = (combo, existingVariants) => {
            return existingVariants.some(variant => {
                // Verificar si tiene la misma cantidad de atributos
                if (variant.attributeValues.length !== combo.length) return false;

                // Verificar si todos los valores coinciden
                return combo.every(c => {
                    return variant.attributeValues.some(av =>
                        av.attributeValue.attributeId === c.attributeId &&
                        av.attributeValue.id === c.valueId
                    );
                });
            });
        };

        // Filtrar combinaciones que ya existen
        const newCombinations = combinations.filter(combo => !variantExists(combo, existingVariants));

        console.log(`  📊 Combinaciones totales: ${combinations.length}`);
        console.log(`  ✓ Ya existentes: ${combinations.length - newCombinations.length}`);
        console.log(`  ➕ Nuevas a crear: ${newCombinations.length}`);

        if (newCombinations.length === 0) {
            console.log('  ℹ️  No hay nuevas combinaciones que crear. Todas ya existen.');
            console.log('\n🔵 [GENERATE VARIANTS] Fin\n');
            return res.json({
                message: 'Todas las variantes ya existen. No se crearon nuevas.',
                generated: 0,
                variants: existingVariants
            });
        }

        const createdVariants = [];
        let variantIndex = 1;
        for (const combo of newCombinations) {
            console.log(`\n    Variante ${variantIndex}/${newCombinations.length}:`);
            // Generar SKU único
            const skuParts = combo.map(c => {
                const shortName = c.attributeName.substring(0, 3).toUpperCase();
                const shortValue = c.value.substring(0, 3).toUpperCase();
                return `${shortName}-${shortValue}`;
            }).join('-');
            const sku = `${product.name.substring(0, 3).toUpperCase()}-${skuParts}-${Date.now()}`;
            console.log(`      SKU: ${sku}`);
            console.log(`      Combinación: ${combo.map(c => `${c.attributeName}=${c.value}`).join(', ')}`);

            // Crear variante con precio inicial en 0 (debe ser configurado después)
            console.log('      💾 Guardando en base de datos...');
            const variant = await prisma.productVariant.create({
                data: {
                    productId,
                    sku,
                    salePrice: 0, // Precio inicial, debe ser configurado por el admin
                    isActive: true,
                    stock: {
                        create: {
                            quantity: 0,
                            reservedQty: 0
                        }
                    },
                    attributeValues: {
                        create: combo.map(c => ({
                            attributeId: c.attributeId,
                            attributeValueId: c.valueId
                        }))
                    }
                },
                include: {
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            });

            createdVariants.push(variant);
            console.log(`      ✅ Creada exitosamente (ID: ${variant.id})`);
            variantIndex++;
        }

        console.log('\n  ✅ Step 8: Proceso completado');
        console.log(`  📊 Resumen:`);
        console.log(`     - Combinaciones posibles: ${combinations.length}`);
        console.log(`     - Ya existían: ${combinations.length - newCombinations.length}`);
        console.log(`     - Variantes NUEVAS creadas: ${createdVariants.length}`);
        console.log(`     - Total variantes del producto: ${existingVariants.length + createdVariants.length}`);
        console.log(`     - Atributos utilizados: ${attributesWithValues.map(a => a.attributeName).join(', ')}`);
        console.log('\n🔵 [GENERATE VARIANTS] Fin\n');

        res.json({
            message: `${createdVariants.length} variantes nuevas creadas (${combinations.length - newCombinations.length} ya existían)`,
            generated: createdVariants.length,
            variants: [...existingVariants, ...createdVariants]
        });
    } catch (error) {
        console.error('Error generating variants:', error);
        res.status(500).json({ error: 'Error al generar variantes' });
    }
});

// Función auxiliar para generar combinaciones
function generateCombinations(attributesWithValues) {
    if (attributesWithValues.length === 0) return [];
    if (attributesWithValues.length === 1) {
        return attributesWithValues[0].values.map(v => [{
            attributeId: attributesWithValues[0].attributeId,
            attributeName: attributesWithValues[0].attributeName,
            valueId: v.id,
            value: v.value
        }]);
    }

    const [first, ...rest] = attributesWithValues;
    const restCombinations = generateCombinations(rest);

    const result = [];
    for (const value of first.values) {
        for (const combo of restCombinations) {
            result.push([
                {
                    attributeId: first.attributeId,
                    attributeName: first.attributeName,
                    valueId: value.id,
                    value: value.value
                },
                ...combo
            ]);
        }
    }
    return result;
}

/**
 * @swagger
 * /products/{productId}/variants/{variantId}:
 *   put:
 *     summary: Actualizar una variante específica (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salePrice:
 *                 type: number
 *                 description: Precio de venta
 *               promotionPrice:
 *                 type: number
 *                 description: Precio promocional (opcional)
 *               cost:
 *                 type: number
 *                 description: Costo del producto (opcional)
 *               stock:
 *                 type: integer
 *                 description: Cantidad en stock
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Variante actualizada
 */
// Crear nueva variante para un producto existente
router.post("/:productId/variants", authMiddleware, adminOnly, async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        console.log(`\n➕ POST /products/${productId}/variants - Crear nueva variante`);
        const { sku, salePrice, promotionPrice, cost, stock, combination } = req.body;
        console.log('Datos:', { sku, salePrice, combination: combination?.length || 0 });

        // Validar datos requeridos
        if (!sku || !salePrice) {
            return res.status(400).json({ error: 'SKU y precio de venta son requeridos' });
        }

        // Crear la variante
        const variant = await prisma.productVariant.create({
            data: {
                productId,
                sku,
                salePrice: Number(salePrice),
                promotionPrice: promotionPrice ? Number(promotionPrice) : null,
                cost: cost ? Number(cost) : null,
                stock: {
                    create: {
                        quantity: stock ?? 0,
                        reservedQty: 0,
                    }
                },
                // Crear relaciones con atributos si existen
                attributeValues: combination && combination.length > 0 ? {
                    create: combination.map(combo => ({
                        attributeId: combo.attributeId,
                        attributeValueId: combo.valueId
                    }))
                } : undefined
            },
            include: {
                stock: true,
                attributeValues: {
                    include: {
                        attributeValue: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`✅ Variante creada: ${variant.sku} (ID: ${variant.id})`);
        res.json(variant);
    } catch (error) {
        console.error('Error creating variant:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El SKU ya existe' });
        }
        res.status(500).json({ error: 'Error al crear variante' });
    }
});

router.put("/:productId/variants/:variantId", authMiddleware, adminOnly, async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const variantId = Number(req.params.variantId);
        console.log(`\\n🔧 PUT /products/${productId}/variants/${variantId} - Actualizar variante`);
        const { salePrice, promotionPrice, cost, stock, isActive, images } = req.body;
        console.log('Datos a actualizar:', { salePrice, promotionPrice, cost, stock, isActive, imagesCount: images?.length });

        // Actualizar datos de la variante
        const variantUpdateData = {};
        if (salePrice !== undefined) variantUpdateData.salePrice = Number(salePrice);
        if (promotionPrice !== undefined) variantUpdateData.promotionPrice = promotionPrice ? Number(promotionPrice) : null;
        if (cost !== undefined) variantUpdateData.cost = cost ? Number(cost) : null;
        if (isActive !== undefined) variantUpdateData.isActive = isActive;

        // Manejar imágenes: eliminar las existentes y crear las nuevas
        if (images !== undefined) {
            console.log(`  📸 Actualizando ${images.length} imágenes de la variante...`);
            // Eliminar imágenes existentes
            await prisma.variantImage.deleteMany({
                where: { variantId }
            });

            // Crear nuevas imágenes
            if (images.length > 0) {
                variantUpdateData.images = {
                    create: images.map(img => ({ url: img.url }))
                };
            }
        }

        const variant = await prisma.productVariant.update({
            where: { id: variantId },
            data: variantUpdateData,
            include: {
                stock: true,
                attributeValues: {
                    include: {
                        attributeValue: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });

        // Actualizar stock si se proporciona
        if (stock !== undefined) {
            console.log(`  📦 Actualizando stock a: ${stock}`);
            await prisma.stock.upsert({
                where: { variantId },
                create: {
                    variantId,
                    quantity: Number(stock),
                    reservedQty: 0
                },
                update: {
                    quantity: Number(stock)
                }
            });

            // Recargar la variante con el stock actualizado
            const updatedVariant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                include: {
                    stock: true,
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            });

            console.log(`✅ Variante actualizada con stock: ${updatedVariant.sku}`);
            return res.json(updatedVariant);
        }

        console.log(`✅ Variante actualizada: ${variant.sku}`);
        res.json(variant);
    } catch (error) {
        console.error('Error updating variant:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /products/{productId}/variants/{variantId}:
 *   delete:
 *     summary: Eliminar una variante (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variante eliminada
 */
router.delete("/:id/variants/:variantId", authMiddleware, adminOnly, async (req, res) => {
    const productId = Number(req.params.id);
    const variantId = Number(req.params.variantId);
    console.log(`\n🗑️ DELETE /products/${productId}/variants/${variantId} - Eliminar variante`);

    await prisma.productVariant.delete({
        where: { id: variantId }
    });

    console.log('✅ Variante eliminada correctamente');
    res.json({ message: 'Variante eliminada correctamente' });
});

export default router;
