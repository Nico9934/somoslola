import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function reserveStock(variantId, quantity) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  });

  if (!variant) throw new Error("Variante no encontrada");
  if (variant.stock < quantity) throw new Error("Stock insuficiente");

  return prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: variant.stock - quantity }
  });
}

export async function releaseStock(variantId, quantity) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  });

  if (!variant) throw new Error("Variante no encontrada");

  return prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: variant.stock + quantity }
  });
}
