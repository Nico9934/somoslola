import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando Seed de datos...");

    // ============ ATRIBUTOS PREDEFINIDOS ============
    console.log("\n📦 Creando atributos globales...");

    // 1. COLOR
    const colorAttribute = await prisma.attribute.upsert({
        where: { slug: 'color' },
        update: {},
        create: {
            name: 'Color',
            slug: 'color',
            type: 'SELECT',
            sortOrder: 1,
            values: {
                create: [
                    { value: 'Rojo', hexColor: '#FF0000', sortOrder: 1 },
                    { value: 'Azul', hexColor: '#0000FF', sortOrder: 2 },
                    { value: 'Verde', hexColor: '#00FF00', sortOrder: 3 },
                    { value: 'Amarillo', hexColor: '#FFFF00', sortOrder: 4 },
                    { value: 'Negro', hexColor: '#000000', sortOrder: 5 },
                    { value: 'Blanco', hexColor: '#FFFFFF', sortOrder: 6 },
                    { value: 'Gris', hexColor: '#808080', sortOrder: 7 },
                    { value: 'Naranja', hexColor: '#FFA500', sortOrder: 8 },
                    { value: 'Rosa', hexColor: '#FFC0CB', sortOrder: 9 },
                    { value: 'Violeta', hexColor: '#8B00FF', sortOrder: 10 },
                ]
            }
        }
    });
    console.log('✅ Color creado');

    // 2. TALLE
    const talleAttribute = await prisma.attribute.upsert({
        where: { slug: 'talle' },
        update: {},
        create: {
            name: 'Talle',
            slug: 'talle',
            type: 'SELECT',
            sortOrder: 2,
            values: {
                create: [
                    { value: 'XXS', sortOrder: 1 },
                    { value: 'XS', sortOrder: 2 },
                    { value: 'S', sortOrder: 3 },
                    { value: 'M', sortOrder: 4 },
                    { value: 'L', sortOrder: 5 },
                    { value: 'XL', sortOrder: 6 },
                    { value: 'XXL', sortOrder: 7 },
                    { value: 'XXXL', sortOrder: 8 },
                ]
            }
        }
    });
    console.log('✅ Talle creado');

    // 3. CAPACIDAD
    const capacidadAttribute = await prisma.attribute.upsert({
        where: { slug: 'capacidad' },
        update: {},
        create: {
            name: 'Capacidad',
            slug: 'capacidad',
            type: 'NUMBER',
            unit: 'ml',
            sortOrder: 3,
            values: {
                create: [
                    { value: '250', sortOrder: 1 },
                    { value: '500', sortOrder: 2 },
                    { value: '750', sortOrder: 3 },
                    { value: '1000', sortOrder: 4 },
                    { value: '1500', sortOrder: 5 },
                    { value: '2000', sortOrder: 6 },
                ]
            }
        }
    });
    console.log('✅ Capacidad creada');

    // 4. MATERIAL
    const materialAttribute = await prisma.attribute.upsert({
        where: { slug: 'material' },
        update: {},
        create: {
            name: 'Material',
            slug: 'material',
            type: 'SELECT',
            sortOrder: 4,
            values: {
                create: [
                    { value: 'Algodón', sortOrder: 1 },
                    { value: 'Poliéster', sortOrder: 2 },
                    { value: 'Algodón/Poliéster', sortOrder: 3 },
                    { value: 'Acero Inoxidable', sortOrder: 4 },
                    { value: 'Plástico', sortOrder: 5 },
                    { value: 'Vidrio', sortOrder: 6 },
                    { value: 'Aluminio', sortOrder: 7 },
                    { value: 'Cerámica', sortOrder: 8 },
                ]
            }
        }
    });
    console.log('✅ Material creado');

    // 5. NÚMERO (Calzado)
    const numeroAttribute = await prisma.attribute.upsert({
        where: { slug: 'numero' },
        update: {},
        create: {
            name: 'Número',
            slug: 'numero',
            type: 'NUMBER',
            sortOrder: 5,
            values: {
                create: [
                    { value: '35', sortOrder: 1 },
                    { value: '36', sortOrder: 2 },
                    { value: '37', sortOrder: 3 },
                    { value: '38', sortOrder: 4 },
                    { value: '39', sortOrder: 5 },
                    { value: '40', sortOrder: 6 },
                    { value: '41', sortOrder: 7 },
                    { value: '42', sortOrder: 8 },
                    { value: '43', sortOrder: 9 },
                    { value: '44', sortOrder: 10 },
                    { value: '45', sortOrder: 11 },
                ]
            }
        }
    });
    console.log('✅ Número creado');

    // 6. PESO
    const pesoAttribute = await prisma.attribute.upsert({
        where: { slug: 'peso' },
        update: {},
        create: {
            name: 'Peso',
            slug: 'peso',
            type: 'NUMBER',
            unit: 'kg',
            sortOrder: 6,
            values: {
                create: [
                    { value: '0.5', sortOrder: 1 },
                    { value: '1', sortOrder: 2 },
                    { value: '2', sortOrder: 3 },
                    { value: '5', sortOrder: 4 },
                    { value: '10', sortOrder: 5 },
                ]
            }
        }
    });
    console.log('✅ Peso creado');

    // 7. ALTO
    const altoAttribute = await prisma.attribute.upsert({
        where: { slug: 'alto' },
        update: {},
        create: {
            name: 'Alto',
            slug: 'alto',
            type: 'NUMBER',
            unit: 'cm',
            sortOrder: 7,
            values: {
                create: [
                    { value: '10', sortOrder: 1 },
                    { value: '15', sortOrder: 2 },
                    { value: '20', sortOrder: 3 },
                    { value: '25', sortOrder: 4 },
                    { value: '30', sortOrder: 5 },
                ]
            }
        }
    });
    console.log('✅ Alto creado');

    console.log("✔ Atributos predefinidos creados\n");

    // ============ USUARIO ADMIN ============
    console.log("👤 Creando usuario admin...");

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

    console.log("✔ Admin creado\n");

    // ============ CATEGORÍAS ============
    console.log("📁 Creando categorías...");

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

    console.log("✔ Categorías creadas\n");

    // ============ PRODUCTOS ============
    console.log("🛍️ Creando productos...");

    // Función helper para crear productos más rápido
    async function seedProduct({ name, description, basePrice, category, variants }) {
        // Buscar si ya existe un producto con este nombre
        const existing = await prisma.product.findFirst({
            where: { name },
        });

        if (existing) {
            console.log(`⚠️ Producto "${name}" ya existe, omitiendo...`);
            return existing;
        }

        // Crear el producto
        const product = await prisma.product.create({
            data: {
                name,
                description,
                basePrice,
                category: { connect: { name: category } },
            },
        });

        // Crear variantes
        for (const v of variants) {
            await prisma.productVariant.upsert({
                where: { sku: v.sku },
                update: {},
                create: {
                    sku: v.sku,
                    stock: v.stock,
                    cost: v.cost,
                    productId: product.id,
                },
            });
        }

        return product;
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

    console.log("✔ Productos creados\n");
    console.log("🎉 Seed completado exitosamente!");
    console.log("📊 7 atributos globales creados");
    console.log("👤 Usuario admin: admin@somoslola.com / admin123");
    console.log("📁 5 categorías creadas");
    console.log("🛍️ 7 productos de ejemplo creados");
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
