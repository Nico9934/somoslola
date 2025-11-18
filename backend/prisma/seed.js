import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando Seed de datos...");

    // Crear Admin
    const adminEmail = "admin@somoslola.com";
    const adminPass = await bcrypt.hash("admin123", 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPass,
            role: "ADMIN",
        },
    });

    // Categorías
    await prisma.category.createMany({
        data: [
            { name: "Remeras" },
            { name: "Pantalones" },
            { name: "Camperas" },
            { name: "Buzos" },
            { name: "Accesorios" },
        ],
        skipDuplicates: true,
    });

    // Función helper para crear productos más rápido
    async function seedProduct({ name, description, basePrice, category, variants }) {
        return await prisma.product.create({
            data: {
                name,
                description,
                basePrice,
                category: { connect: { name: category } },
                variants: {
                    create: variants.map((v) => ({
                        sku: v.sku,
                        stock: v.stock,
                        cost: v.cost,
                    })),
                },
            },
        });
    }

    // Productos con variantes
    await seedProduct({
        name: "Remera Oversize Básica",
        description: "Remera de algodón premium corte oversize.",
        basePrice: 9990,
        category: "Remeras",
        variants: [
            { sku: "REM-OVS-BLK-S", stock: 10, cost: 5000 },
            { sku: "REM-OVS-BLK-M", stock: 12, cost: 5000 },
            { sku: "REM-OVS-BLK-L", stock: 8, cost: 5000 },
        ],
    });

    await seedProduct({
        name: "Remera Estampada Street",
        description: "Estampa full print, edición limitada.",
        basePrice: 11990,
        category: "Remeras",
        variants: [
            { sku: "REM-STP-WHT-M", stock: 20, cost: 5500 },
            { sku: "REM-STP-WHT-L", stock: 15, cost: 5500 },
        ],
    });

    await seedProduct({
        name: "Pantalón Cargo Urban",
        description: "Relaxed fit con múltiples bolsillos.",
        basePrice: 15990,
        category: "Pantalones",
        variants: [
            { sku: "PNT-CRG-GRN-S", stock: 5, cost: 9000 },
            { sku: "PNT-CRG-GRN-M", stock: 7, cost: 9000 },
            { sku: "PNT-CRG-GRN-L", stock: 6, cost: 9000 },
        ],
    });

    await seedProduct({
        name: "Jogger Frisa Premium",
        description: "Jogger de frisa con puños elastizados.",
        basePrice: 13990,
        category: "Pantalones",
        variants: [
            { sku: "PNT-JGR-GRY-M", stock: 14, cost: 8000 },
            { sku: "PNT-JGR-GRY-L", stock: 10, cost: 8000 },
        ],
    });

    await seedProduct({
        name: "Campera Rompeviento Nylon",
        description: "Liviana e impermeable para media estación.",
        basePrice: 19990,
        category: "Camperas",
        variants: [
            { sku: "CMP-RMT-BLU-S", stock: 4, cost: 11000 },
            { sku: "CMP-RMT-BLU-M", stock: 6, cost: 11000 },
        ],
    });

    await seedProduct({
        name: "Buzo Hoodie Clásico",
        description: "Buzo canguro frisa alta calidad.",
        basePrice: 17990,
        category: "Buzos",
        variants: [
            { sku: "BUZ-HOD-BLK-M", stock: 10, cost: 9000 },
            { sku: "BUZ-HOD-BLK-L", stock: 8, cost: 9000 },
        ],
    });

    await seedProduct({
        name: "Gorra Snapback Logo",
        description: "Gorra estilo urbano con logo bordado.",
        basePrice: 7990,
        category: "Accesorios",
        variants: [
            { sku: "ACC-HAT-BLK", stock: 25, cost: 3000 },
            { sku: "ACC-HAT-RED", stock: 15, cost: 3000 },
        ],
    });

    console.log("✔ Seed generado correctamente.");
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
