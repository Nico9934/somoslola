import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function releaseExpiredStock() {
  const now = new Date();

  const expired = await prisma.cartItem.findMany({
    where: { expiresAt: { lt: now } },
    include: {
      variant: {
        include: {
          stock: true
        }
      }
    }
  });

  for (const item of expired) {
    // Liberar stock reservado
    await prisma.stock.update({
      where: { variantId: item.variantId },
      data: {
        reservedQty: {
          decrement: item.quantity
        }
      }
    });

    // Eliminar item del carrito
    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  if (expired.length > 0) {
    console.log(`♻️ Liberadas ${expired.length} reservas de stock expiradas`);
  }
}
