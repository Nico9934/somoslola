import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Attribute:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           example: Color
 *         slug:
 *           type: string
 *           example: color
 *         type:
 *           type: string
 *           enum: [SELECT, NUMBER, TEXT]
 *           example: SELECT
 *         unit:
 *           type: string
 *           example: ml
 *         isActive:
 *           type: boolean
 *         sortOrder:
 *           type: integer
 *         values:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttributeValue'
 *     AttributeValue:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         attributeId:
 *           type: integer
 *         value:
 *           type: string
 *           example: Rojo
 *         hexColor:
 *           type: string
 *           example: "#FF0000"
 *         sortOrder:
 *           type: integer
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/attributes:
 *   get:
 *     summary: Obtener todos los atributos
 *     tags: [Attributes]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir atributos inactivos
 *     responses:
 *       200:
 *         description: Lista de atributos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attribute'
 */
router.get('/', async (req, res) => {
    try {
        const { includeInactive } = req.query;
        console.log('\n🏷️ GET /attributes - Listar atributos');
        console.log('  Filtros:', { includeInactive });

        const attributes = await prisma.attribute.findMany({
            where: includeInactive === 'true' ? {} : { isActive: true },
            include: {
                values: {
                    where: includeInactive === 'true' ? {} : { isActive: true },
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: { sortOrder: 'asc' }
        });

        console.log(`  ✅ Retornando ${attributes.length} atributos`);
        attributes.forEach(attr => {
            console.log(`     - ${attr.name}: ${attr.values.length} valores`);
        });

        res.json(attributes);
    } catch (error) {
        console.error('Error fetching attributes:', error);
        res.status(500).json({ error: 'Error al obtener atributos' });
    }
});

/**
 * @swagger
 * /api/attributes/{id}:
 *   get:
 *     summary: Obtener un atributo por ID
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atributo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attribute'
 *       404:
 *         description: Atributo no encontrado
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`\n🔍 GET /attributes/${id} - Obtener atributo por ID`);

        const attribute = await prisma.attribute.findUnique({
            where: { id: parseInt(id) },
            include: {
                values: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!attribute) {
            console.log('  ❌ Atributo no encontrado');
            return res.status(404).json({ error: 'Atributo no encontrado' });
        }

        console.log(`  ✅ Atributo encontrado: ${attribute.name}`);
        console.log(`     Valores: ${attribute.values.length}`);

        res.json(attribute);
    } catch (error) {
        console.error('Error fetching attribute:', error);
        res.status(500).json({ error: 'Error al obtener atributo' });
    }
});

/**
 * @swagger
 * /api/attributes:
 *   post:
 *     summary: Crear un nuevo atributo
 *     tags: [Attributes]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Color
 *               type:
 *                 type: string
 *                 enum: [SELECT, NUMBER, TEXT]
 *                 example: SELECT
 *               unit:
 *                 type: string
 *                 example: ml
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Atributo creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo admin)
 */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, type, unit, sortOrder } = req.body;
        console.log('\n➕ POST /attributes - Crear atributo');
        console.log('  Datos:', { name, type, unit, sortOrder });

        if (!name || !type) {
            console.log('  ❌ Validación fallida: nombre y tipo requeridos');
            return res.status(400).json({ error: 'Nombre y tipo son requeridos' });
        }

        // Generar slug desde el nombre
        console.log('  🔗 Generando slug...');
        const slug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        console.log(`     Slug generado: ${slug}`);

        console.log('  💾 Guardando en base de datos...');
        const attribute = await prisma.attribute.create({
            data: {
                name,
                slug,
                type,
                unit,
                sortOrder: sortOrder || 0
            },
            include: {
                values: true
            }
        });

        console.log(`  ✅ Atributo creado: ${attribute.name} (ID: ${attribute.id})`);
        res.status(201).json(attribute);
    } catch (error) {
        console.error('Error creating attribute:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un atributo con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear atributo' });
    }
});

/**
 * @swagger
 * /api/attributes/{id}:
 *   put:
 *     summary: Actualizar un atributo
 *     tags: [Attributes]
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
 *               type:
 *                 type: string
 *                 enum: [SELECT, NUMBER, TEXT]
 *               unit:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Atributo actualizado
 *       404:
 *         description: Atributo no encontrado
 */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, unit, isActive, sortOrder } = req.body;

        const updateData = {};
        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        if (type !== undefined) updateData.type = type;
        if (unit !== undefined) updateData.unit = unit;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const attribute = await prisma.attribute.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                values: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        res.json(attribute);
    } catch (error) {
        console.error('Error updating attribute:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Atributo no encontrado' });
        }
        res.status(500).json({ error: 'Error al actualizar atributo' });
    }
});

/**
 * @swagger
 * /api/attributes/{id}:
 *   delete:
 *     summary: Eliminar un atributo
 *     tags: [Attributes]
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
 *         description: Atributo eliminado
 *       404:
 *         description: Atributo no encontrado
 */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.attribute.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Atributo eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Atributo no encontrado' });
        }
        res.status(500).json({ error: 'Error al eliminar atributo' });
    }
});

// ==================== ATTRIBUTE VALUES ====================

/**
 * @swagger
 * /api/attributes/{id}/values:
 *   post:
 *     summary: Agregar valor a un atributo
 *     tags: [Attributes]
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
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: Rojo
 *               hexColor:
 *                 type: string
 *                 example: "#FF0000"
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Valor agregado
 */
router.post('/:id/values', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { value, hexColor, sortOrder } = req.body;
        console.log(`\n➕ POST /attributes/${id}/values - Agregar valor`);
        console.log('  Datos:', { value, hexColor, sortOrder });

        if (!value) {
            console.log('  ❌ Validación fallida: valor requerido');
            return res.status(400).json({ error: 'El valor es requerido' });
        }

        console.log('  💾 Guardando valor en base de datos...');
        const attributeValue = await prisma.attributeValue.create({
            data: {
                attributeId: parseInt(id),
                value,
                hexColor,
                sortOrder: sortOrder || 0
            }
        });

        console.log(`  ✅ Valor creado: ${attributeValue.value} (ID: ${attributeValue.id})`);
        res.status(201).json(attributeValue);
    } catch (error) {
        console.error('Error creating attribute value:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Este valor ya existe para el atributo' });
        }
        res.status(500).json({ error: 'Error al crear valor de atributo' });
    }
});

/**
 * @swagger
 * /api/attributes/{attributeId}/values/{valueId}:
 *   put:
 *     summary: Actualizar valor de atributo
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               hexColor:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Valor actualizado
 */
router.put('/:attributeId/values/:valueId', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { attributeId, valueId } = req.params;
        const { value, hexColor, isActive, sortOrder } = req.body;
        console.log(`\n✏️ PUT /attributes/${attributeId}/values/${valueId} - Actualizar valor`);
        console.log('  Datos:', { value, hexColor, isActive, sortOrder });

        const updateData = {};
        if (value !== undefined) updateData.value = value;
        if (hexColor !== undefined) updateData.hexColor = hexColor;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        console.log('  Campos a actualizar:', Object.keys(updateData));
        console.log('  💾 Guardando cambios...');

        const attributeValue = await prisma.attributeValue.update({
            where: { id: parseInt(valueId) },
            data: updateData
        });

        console.log(`  ✅ Valor actualizado: ${attributeValue.value}`);
        res.json(attributeValue);
    } catch (error) {
        console.error('Error updating attribute value:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Valor no encontrado' });
        }
        res.status(500).json({ error: 'Error al actualizar valor' });
    }
});

/**
 * @swagger
 * /api/attributes/{attributeId}/values/{valueId}:
 *   delete:
 *     summary: Eliminar valor de atributo
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Valor eliminado
 */
router.delete('/:attributeId/values/:valueId', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { valueId } = req.params;

        await prisma.attributeValue.delete({
            where: { id: parseInt(valueId) }
        });

        res.json({ message: 'Valor eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting attribute value:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Valor no encontrado' });
        }
        res.status(500).json({ error: 'Error al eliminar valor' });
    }
});

export default router;
