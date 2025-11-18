import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operaciones de checkout y gestión de pedidos
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Genera una orden desde carrito (guest o usuario)
 *     tags: [Orders]
 */
router.post("/checkout", async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        const { cartId, email } = req.body;

        // Guest requiere ambos datos
        if (!userId && (!email || !cartId)) {
            return res.status(400).json({ error: "Guest checkout requiere email y cartId" });
        }

        // Obtener carrito
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        // Validación final de stock definitivo
        for (const item of cart.items) {
            if (item.quantity > item.variant.stock) {
                return res.status(400).json({
                    error: `Sin stock suficiente para SKU ${item.variant.sku}`,
                });
            }
        }

        // Calcular total REAL basado en cada producto
        const total = cart.items.reduce(
            (sum, item) => sum + item.variant.product.basePrice * item.quantity,
            0
        );

        // Crear orden
        const order = await prisma.order.create({
            data: {
                userId,
                email: userId ? undefined : email,
                total,
                status: "PENDING",
                items: {
                    create: cart.items.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.variant.product.basePrice,
                    })),
                },
            },
            include: { items: true },
        });

        // Descontar stock definitivo
        for (const item of cart.items) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        // Vaciar carrito
        await prisma.cartItem.deleteMany({ where: { cartId } });

        return res.json({ message: "Orden creada", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar checkout" });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtiene una orden del usuario autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true },
                    },
                },
            },
        },
    });

    if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(order);
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista todas las órdenes (solo admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    const orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });

    res.json(orders);
});

export default router;
