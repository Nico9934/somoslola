import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function releaseExpiredStock() {
  const now = new Date();

  const expired = await prisma.cartItem.findMany({
    where: { expiresAt: { lt: now } },
    include: { variant: true }
  });

  for (const item of expired) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: item.variant.stock + item.quantity }
    });

    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  if (expired.length > 0) {
    console.log("♻ Liberadas  reservas de stock");
  }
}
