import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Libera reservas de stock de órdenes PENDING que excedieron el tiempo límite (24 horas)
 * y las cancela automáticamente
 */
export async function releaseExpiredOrders() {
    try {
        const now = new Date();

        // Buscar órdenes PENDING cuyo reservedUntil ya pasó
        const expiredOrders = await prisma.order.findMany({
            where: {
                status: "PENDING",
                reservedUntil: {
                    lt: now,
                    not: null
                }
            },
            include: {
                items: true
            }
        });

        if (expiredOrders.length === 0) {
            return; // No hay órdenes expiradas
        }

        console.log(`⏰ [${now.toISOString()}] Procesando ${expiredOrders.length} órdenes PENDING expiradas...`);

        for (const order of expiredOrders) {
            try {
                await prisma.$transaction(async (tx) => {
                    // Liberar stock reservado de cada item
                    for (const item of order.items) {
                        if (item.variantId) {
                            await tx.stock.update({
                                where: { variantId: item.variantId },
                                data: { reservedQty: { decrement: item.quantity } }
                            });
                        }
                    }

                    // Cancelar la orden
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: "CANCELLED" }
                    });
                });

                console.log(`   ✅ Orden #${order.id} cancelada y reservas liberadas (expiró: ${order.reservedUntil.toISOString()})`);
            } catch (error) {
                console.error(`   ❌ Error procesando orden #${order.id}:`, error.message);
                // Continuar con las demás órdenes aunque una falle
            }
        }

        console.log(`⏰ Liberación completada: ${expiredOrders.length} órdenes procesadas`);
    } catch (error) {
        console.error('❌ Error en releaseExpiredOrders:', error);
    }
}
