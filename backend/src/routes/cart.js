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
  let userId = null;

  try {
    if (req.headers.authorization) {
      const { authMiddleware } = await import("../middleware/auth.js");
      await new Promise((resolve, reject) =>
        authMiddleware(
          req,
          { status: () => ({ json: reject }), json: reject },
          resolve
        )
      );
      userId = req.user?.id ?? null;
    }
  } catch {
    userId = null;
  }

  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true }
    });
    if (existing) return res.json(existing);
  }

  const cart = await prisma.cart.create({ data: { userId } });
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
  const cart = await prisma.cart.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          variant: { include: { product: true } }
        }
      }
    }
  });

  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
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
  const { variantId, quantity } = req.body;
  const cartId = req.params.id;

  const variant = await prisma.productVariant.findUnique({
    where: { id: Number(variantId) }
  });

  if (!variant) return res.status(404).json({ error: "Variante no encontrada" });
  if (variant.stock < quantity)
    return res.status(400).json({ error: "Stock insuficiente" });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId, variantId }
  });

  if (existingItem) {
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock: { decrement: quantity } }
    });

    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        reservedAt: new Date(),
        expiresAt
      }
    });

    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { cartId, variantId, quantity, expiresAt }
  });

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { stock: { decrement: quantity } }
  });

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
  const { cartId, variantId } = req.params;
  const { quantity } = req.body;

  const item = await prisma.cartItem.findFirst({
    where: { cartId, variantId: Number(variantId) }
  });

  if (!item) return res.status(404).json({ error: "Item no encontrado" });
  if (quantity <= 0) return res.status(400).json({ error: "Cantidad inválida" });

  const diff = quantity - item.quantity;

  if (diff > 0) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(variantId) }
    });
    if (!variant || variant.stock < diff)
      return res.status(400).json({ error: "Stock insuficiente" });

    await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { stock: { decrement: diff } }
    });
  }

  if (diff < 0) {
    await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { stock: { increment: Math.abs(diff) } }
    });
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity }
  });

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
  const { cartId, variantId } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { cartId, variantId: Number(variantId) }
  });

  if (!item) return res.status(404).json({ error: "Item no encontrado para esa variante" });

  await prisma.productVariant.update({
    where: { id: item.variantId },
    data: { stock: { increment: item.quantity } }
  });

  await prisma.cartItem.delete({ where: { id: item.id } });

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
  const cartId = req.params.id;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true }
  });

  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  for (const item of cart.items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } }
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId } });

  res.json({ message: "Carrito vaciado correctamente" });
});

export default router;
