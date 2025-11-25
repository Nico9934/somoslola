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
 * /orders/calculate-shipping:
 *   post:
 *     summary: Calcula costo de envío según código postal
 *     tags: [Orders]
 */
router.post("/calculate-shipping", async (req, res) => {
    try {
        const { postalCode } = req.body;
        const cp = Number(postalCode);

        if (!cp) {
            return res.status(400).json({ error: "Código postal inválido" });
        }

        // Buscar zona de envío que coincida con el CP
        const zone = await prisma.shippingZone.findFirst({
            where: {
                OR: [
                    { cpStart: { lte: cp }, cpEnd: { gte: cp } },
                    { cpStart: null } // Interior del país (fallback)
                ]
            },
            orderBy: [
                { cpStart: 'asc' } // Priorizar zonas específicas sobre fallback
            ]
        });

        if (!zone) {
            // Fallback por si no hay zonas configuradas
            return res.json({ shippingCost: 6000 });
        }

        console.log(`📦 Costo de envío para CP ${cp}: $${zone.price} (${zone.name})`);
        return res.json({ shippingCost: zone.price });
    } catch (error) {
        console.error("❌ Error al calcular envío:", error);
        res.status(500).json({ error: "Error al calcular envío" });
    }
});

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
        const {
            cartId,
            email,
            customerName,
            customerPhone,
            shippingAddress,
            shippingCity,
            shippingState,
            shippingPostalCode,
            shippingCost,
            paymentMethod
        } = req.body;

        // Validaciones de campos requeridos
        if (!cartId || !email || !customerName || !customerPhone ||
            !shippingAddress || !shippingCity || !shippingState ||
            !shippingPostalCode || shippingCost === undefined || !paymentMethod) {
            return res.status(400).json({ error: "Faltan datos requeridos para el checkout" });
        }

        if (!["CARD", "TRANSFER"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Método de pago inválido" });
        }

        // Obtener carrito con todos los datos necesarios para snapshot
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                images: true, // Para snapshot de imagen
                            },
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

        // Calcular total de productos
        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.variant.product.basePrice * item.quantity,
            0
        );

        // Total final = subtotal + envío
        const total = subtotal + shippingCost;

        // Crear orden con snapshot de datos para preservar historial
        const order = await prisma.order.create({
            data: {
                userId,
                email,
                customerName,
                customerPhone,
                shippingAddress,
                shippingCity,
                shippingState,
                shippingPostalCode,
                shippingCost,
                paymentMethod,
                total,
                status: "PENDING",
                items: {
                    create: cart.items.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.variant.product.basePrice,
                        // 📸 Snapshot de datos para preservar información
                        productName: item.variant.product.name,
                        variantSku: item.variant.sku,
                        imageUrl: item.variant.images?.[0]?.url || null,
                        attributes: item.variant.attributes || {},
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

        console.log("✅ Orden creada exitosamente:", order.id, "- Total:", total, "- Método:", paymentMethod);
        return res.json({ message: "Orden creada exitosamente", order });
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
