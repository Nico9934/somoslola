import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Gestión del carrito de compras y reserva de stock
 */

/* -------------------------------------------------------
   🧹 POST /cart/cleanup-expired - Limpiar reservas expiradas
------------------------------------------------------- */
/**
 * @swagger
 * /cart/cleanup-expired:
 *   post:
 *     summary: Limpia las reservas de stock de items expirados en carritos
 *     tags: [Cart]
 *     responses:
 *       200: { description: Reservas expiradas limpiadas }
 */
router.post("/cleanup-expired", async (req, res) => {
  console.log('🧹 === INICIO LIMPIEZA ITEMS EXPIRADOS ===');
  try {
    const now = new Date();
    console.log('⏰ Hora actual:', now.toISOString());

    // Buscar todos los items expirados
    const expiredItems = await prisma.cartItem.findMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    console.log(`🔍 Encontrados ${expiredItems.length} items expirados:`,
      expiredItems.map(i => ({ id: i.id, variantId: i.variantId, cantidad: i.quantity, expiradoEn: i.expiresAt }))
    );

    // Liberar stock reservado de cada item expirado
    for (const item of expiredItems) {
      console.log(`📦 Liberando stock para variantId ${item.variantId}, cantidad: ${item.quantity}`);
      await prisma.stock.update({
        where: { variantId: item.variantId },
        data: { reservedQty: { decrement: item.quantity } }
      });
    }

    // Eliminar items expirados
    const deleted = await prisma.cartItem.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    const totalReleased = expiredItems.reduce((sum, item) => sum + item.quantity, 0);
    console.log(`✅ Limpieza completada: ${deleted.count} items eliminados, ${totalReleased} unidades liberadas`);

    res.json({
      message: "Reservas expiradas limpiadas",
      itemsDeleted: deleted.count,
      stockReleased: totalReleased
    });
  } catch (error) {
    console.error('❌ Error al limpiar items expirados:', error);
    res.status(500).json({ error: "Error al limpiar reservas expiradas" });
  } finally {
    console.log('🧹 === FIN LIMPIEZA ITEMS EXPIRADOS ===\n');
  }
});

/* -------------------------------------------------------
   🛒 POST /cart - Crear u obtener carrito actual
------------------------------------------------------- */
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Crea u obtiene el carrito actual (guest o usuario autenticado)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito creado o existente
 */
router.post("/", async (req, res) => {
  console.log('🛒 === INICIO CREAR/OBTENER CARRITO ===');
  console.log('📥 Headers de request:', { authorization: req.headers.authorization ? 'Presente' : 'Ninguno' });

  let userId = null;

  try {
    if (req.headers.authorization) {
      console.log('🔐 Verificando autorización...');
      const { authMiddleware } = await import("../middleware/auth.js");
      await new Promise((resolve, reject) =>
        authMiddleware(
          req,
          { status: () => ({ json: reject }), json: reject },
          resolve
        )
      );
      userId = req.user?.id ?? null;
      console.log('✅ Usuario autenticado:', userId);
    }
  } catch (error) {
    console.log('⚠️ Sin autenticación válida, creando carrito de invitado');
    userId = null;
  }

  if (userId) {
    console.log('🔍 Buscando carrito existente para usuario:', userId);
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    });
    if (existing) {
      console.log('✅ Carrito existente encontrado:', { id: existing.id, cantidadItems: existing.items.length });
      console.log('🛒 === FIN CREAR/OBTENER CARRITO ===\n');
      return res.json(existing);
    }
    console.log('📝 No hay carrito existente, creando nuevo...');
  }

  const cart = await prisma.cart.create({ data: { userId } });
  console.log('✅ Carrito creado:', { id: cart.id, userId: cart.userId });
  console.log('🛒 === FIN CREAR/OBTENER CARRITO ===\n');
  return res.json(cart);
});

/* -------------------------------------------------------
   🛍 GET /cart/{id} - Obtener carrito
------------------------------------------------------- */
/**
 * @swagger
 * /cart/{id}:
 *   get:
 *     summary: Obtiene un carrito por su ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Carrito encontrado }
 *       404: { description: Carrito no encontrado }
 */
router.get("/:id", async (req, res) => {
  console.log('📖 === INICIO OBTENER CARRITO ===');
  console.log('📥 ID del carrito:', req.params.id);

  const cart = await prisma.cart.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: true }
              },
              attributeValues: {
                include: {
                  attributeValue: {
                    include: { attribute: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!cart) {
    console.log('❌ Carrito no encontrado');
    console.log('📖 === FIN OBTENER CARRITO ===\n');
    return res.status(404).json({ error: "Carrito no encontrado" });
  }

  console.log('✅ Carrito encontrado:', {
    id: cart.id,
    cantidadItems: cart.items.length,
    items: cart.items.map(i => ({ variantId: i.variantId, cantidad: i.quantity }))
  });
  console.log('📖 === FIN OBTENER CARRITO ===\n');
  res.json(cart);
});

/* -------------------------------------------------------
   🛒 POST /cart/{id}/items - Agregar variante
------------------------------------------------------- */
/**
 * @swagger
 * /cart/{id}/items:
 *   post:
 *     summary: Agrega una variante al carrito y descuenta stock
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del carrito
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variantId, quantity]
 *             properties:
 *               variantId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200: { description: Variante agregada al carrito }
 *       400: { description: Stock insuficiente }
 *       404: { description: Variante no encontrada }
 */
router.post("/:id/items", async (req, res) => {
  console.log('➕ === INICIO AGREGAR AL CARRITO ===');
  const { variantId, quantity } = req.body;
  const cartId = req.params.id;

  console.log('📥 Solicitud:', { carritoId: cartId, variantId: Number(variantId), cantidad: quantity });

  // Obtener variante con su stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: Number(variantId) },
    include: { stock: true }
  });

  if (!variant) {
    console.log('❌ Variante no encontrada:', variantId);
    console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
    return res.status(404).json({ error: "Variante no encontrada" });
  }

  console.log('✅ Variante encontrada:', { id: variant.id, sku: variant.sku });

  // Verificar que tenga stock configurado
  if (!variant.stock) {
    console.log('❌ Stock no configurado para variante:', variantId);
    console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
    return res.status(400).json({ error: "Stock no configurado para esta variante" });
  }

  // Calcular stock disponible real (stock total - stock reservado)
  const availableStock = variant.stock.quantity - variant.stock.reservedQty;

  console.log('📦 Info de stock:', {
    total: variant.stock.quantity,
    reservado: variant.stock.reservedQty,
    disponible: availableStock,
    solicitado: quantity
  });

  // Buscar si ya existe en el carrito
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId, variantId: Number(variantId) }
  });

  console.log('🔍 Item existente:', existingItem ? { id: existingItem.id, cantidad: existingItem.quantity } : null);

  // Si ya existe, validar que la suma no exceda el stock disponible
  if (existingItem) {
    const totalRequested = existingItem.quantity + quantity;

    console.log('📊 Validación:', {
      yaEnCarrito: existingItem.quantity,
      agregando: quantity,
      totalSolicitado: totalRequested,
      stockDisponible: availableStock
    });

    if (totalRequested > availableStock) {
      console.log('❌ Stock insuficiente');
      console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
      return res.status(400).json({
        error: "Stock insuficiente",
        details: {
          available: availableStock,
          inCart: existingItem.quantity,
          requested: quantity,
          maxCanAdd: availableStock - existingItem.quantity
        }
      });
    }

    // Actualizar stock reservado
    const stockBefore = await prisma.stock.findUnique({
      where: { variantId: variant.id }
    });

    console.log('📦 Stock ANTES de actualizar:', {
      variantId: variant.id,
      stockTotal: stockBefore.quantity,
      stockReservado: stockBefore.reservedQty,
      incrementando: quantity
    });

    await prisma.stock.update({
      where: { variantId: variant.id },
      data: { reservedQty: { increment: quantity } }
    });

    const stockAfter = await prisma.stock.findUnique({
      where: { variantId: variant.id }
    });

    console.log('📦 Stock DESPUÉS de actualizar:', {
      variantId: variant.id,
      stockTotal: stockAfter.quantity,
      stockReservado: stockAfter.reservedQty,
      esperado: stockBefore.reservedQty + quantity
    });

    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: totalRequested,
        reservedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    console.log('✅ Item actualizado. Nueva cantidad:', updated.quantity);
    console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
    return res.json(updated);
  }

  // Si es nuevo, validar que no exceda el stock disponible
  if (quantity > availableStock) {
    console.log('❌ Stock insuficiente para nuevo item');
    console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
    return res.status(400).json({
      error: "Stock insuficiente",
      details: {
        available: availableStock,
        requested: quantity
      }
    });
  }

  // Crear nuevo item
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const item = await prisma.cartItem.create({
    data: { cartId, variantId: Number(variantId), quantity, expiresAt }
  });

  console.log('✅ Nuevo item creado:', { id: item.id, cantidad: item.quantity, expiraEn: item.expiresAt });

  // Reservar stock
  const stockBefore = await prisma.stock.findUnique({
    where: { variantId: variant.id }
  });

  console.log('📦 Stock ANTES de crear nuevo item:', {
    variantId: variant.id,
    stockTotal: stockBefore.quantity,
    stockReservado: stockBefore.reservedQty,
    incrementando: quantity
  });

  await prisma.stock.update({
    where: { variantId: variant.id },
    data: { reservedQty: { increment: quantity } }
  });

  const stockAfter = await prisma.stock.findUnique({
    where: { variantId: variant.id }
  });

  console.log('📦 Stock DESPUÉS de crear nuevo item:', {
    variantId: variant.id,
    stockTotal: stockAfter.quantity,
    stockReservado: stockAfter.reservedQty,
    esperado: stockBefore.reservedQty + quantity
  });

  console.log('✅ Item agregado al carrito exitosamente');
  console.log('➕ === FIN AGREGAR AL CARRITO ===\n');
  res.json(item);
});

/* -------------------------------------------------------
   🔄 PATCH /cart/{cartId}/variant/{variantId} - Modificar cantidad
------------------------------------------------------- */
/**
 * @swagger
 * /cart/{cartId}/variant/{variantId}:
 *   patch:
 *     summary: Modifica la cantidad de una variante en el carrito
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200: { description: Cantidad actualizada }
 *       400: { description: Cantidad inválida o stock insuficiente }
 *       404: { description: Item no encontrado }
 */
router.patch("/:cartId/variant/:variantId", async (req, res) => {
  console.log('🔄 === INICIO ACTUALIZAR CANTIDAD ===');
  const { cartId, variantId } = req.params;
  const { quantity } = req.body;

  console.log('📥 Actualizando cantidad del item:', {
    carritoId: cartId,
    variantId: Number(variantId),
    nuevaCantidad: quantity
  });

  const item = await prisma.cartItem.findFirst({
    where: { cartId, variantId: Number(variantId) }
  });

  if (!item) {
    console.log('❌ Item no encontrado');
    console.log('🔄 === FIN ACTUALIZAR CANTIDAD ===\n');
    return res.status(404).json({ error: "Item no encontrado" });
  }
  if (quantity <= 0) {
    console.log('❌ Cantidad inválida');
    console.log('🔄 === FIN ACTUALIZAR CANTIDAD ===\n');
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  const diff = quantity - item.quantity;

  console.log('📊 Cambio en cantidad:', {
    cantidadAnterior: item.quantity,
    cantidadNueva: quantity,
    diferencia: diff
  });

  if (diff > 0) {
    // Verificar stock disponible
    const stock = await prisma.stock.findUnique({
      where: { variantId: Number(variantId) }
    });

    const availableStock = (stock?.quantity || 0) - (stock?.reservedQty || 0);

    console.log('📦 Verificación de stock para incremento:', {
      total: stock?.quantity,
      reservado: stock?.reservedQty,
      disponible: availableStock,
      necesario: diff
    });

    if (availableStock < diff) {
      console.log('❌ Stock insuficiente');
      console.log('🔄 === FIN ACTUALIZAR CANTIDAD ===\n');
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // Incrementar cantidad reservada
    await prisma.stock.update({
      where: { variantId: Number(variantId) },
      data: { reservedQty: { increment: diff } }
    });

    const stockAfter = await prisma.stock.findUnique({
      where: { variantId: Number(variantId) }
    });

    console.log('📦 Stock DESPUÉS de incrementar:', {
      stockReservado: stockAfter.reservedQty,
      esperado: stock.reservedQty + diff
    });
  }

  if (diff < 0) {
    // Decrementar cantidad reservada
    await prisma.stock.update({
      where: { variantId: Number(variantId) },
      data: { reservedQty: { decrement: Math.abs(diff) } }
    });

    const stockAfter = await prisma.stock.findUnique({
      where: { variantId: Number(variantId) }
    });

    console.log('📦 Stock DESPUÉS de decrementar:', {
      stockReservado: stockAfter.reservedQty,
      decrementado: Math.abs(diff)
    });
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity }
  });

  console.log('✅ Item del carrito actualizado:', { id: updated.id, cantidad: updated.quantity });
  console.log('🔄 === FIN ACTUALIZAR CANTIDAD ===\n');

  res.json(updated);
});

/* -------------------------------------------------------
   ❌ DELETE /cart/{cartId}/variant/{variantId} - Eliminar variante
------------------------------------------------------- */
/**
 * @swagger
 * /cart/{cartId}/variant/{variantId}:
 *   delete:
 *     summary: Elimina una variante del carrito y devuelve stock
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Variante eliminada del carrito }
 *       404: { description: Variante no existe en el carrito }
 */
router.delete("/:cartId/variant/:variantId", async (req, res) => {
  console.log('🗑️ === INICIO ELIMINAR ITEM ===');
  const { cartId, variantId } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { cartId, variantId: Number(variantId) }
  });

  if (!item) {
    console.log('❌ Item no encontrado');
    console.log('🗑️ === FIN ELIMINAR ITEM ===\n');
    return res.status(404).json({ error: "Item no encontrado para esa variante" });
  }

  console.log('📥 Eliminando item del carrito:', {
    carritoId: cartId,
    variantId: Number(variantId),
    cantidad: item.quantity
  });

  // Liberar stock reservado
  const stockBefore = await prisma.stock.findUnique({
    where: { variantId: Number(variantId) }
  });

  console.log('📦 Stock ANTES de eliminar:', {
    variantId: Number(variantId),
    stockTotal: stockBefore.quantity,
    stockReservado: stockBefore.reservedQty,
    liberando: item.quantity
  });

  await prisma.stock.update({
    where: { variantId: Number(variantId) },
    data: { reservedQty: { decrement: item.quantity } }
  });

  const stockAfter = await prisma.stock.findUnique({
    where: { variantId: Number(variantId) }
  });

  console.log('📦 Stock DESPUÉS de eliminar:', {
    variantId: Number(variantId),
    stockTotal: stockAfter.quantity,
    stockReservado: stockAfter.reservedQty,
    esperado: stockBefore.reservedQty - item.quantity
  });

  // Eliminar item del carrito
  await prisma.cartItem.delete({ where: { id: item.id } });

  console.log('✅ Item eliminado del carrito. Stock liberado:', item.quantity);
  console.log('🗑️ === FIN ELIMINAR ITEM ===\n');

  res.json({ message: "Variante eliminada del carrito" });
});

/* -------------------------------------------------------
   🗑 DELETE /cart/{id} - Vaciar carrito completo
------------------------------------------------------- */
/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Elimina todos los ítems del carrito y libera el stock reservado
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carrito vaciado }
 *       404: { description: Carrito no encontrado }
 */
router.delete("/:id", async (req, res) => {
  console.log('🗑️ === INICIO VACIAR CARRITO ===');
  const cartId = req.params.id;
  console.log('📥 ID del carrito:', cartId);

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true }
  });

  if (!cart) {
    console.log('❌ Carrito no encontrado');
    console.log('🗑️ === FIN VACIAR CARRITO ===\n');
    return res.status(404).json({ error: "Carrito no encontrado" });
  }

  console.log(`🔍 Liberando stock de ${cart.items.length} items...`);

  // Liberar stock reservado de todos los items
  for (const item of cart.items) {
    console.log(`📦 Liberando variantId ${item.variantId}, cantidad: ${item.quantity}`);
    await prisma.stock.update({
      where: { variantId: item.variantId },
      data: { reservedQty: { decrement: item.quantity } }
    });
  }

  // Eliminar todos los items del carrito
  await prisma.cartItem.deleteMany({ where: { cartId } });

  console.log(`✅ Carrito vaciado. Stock liberado para ${cart.items.length} items`);
  console.log('🗑️ === FIN VACIAR CARRITO ===\n');

  res.json({ message: "Carrito vaciado correctamente" });
});

export default router;
