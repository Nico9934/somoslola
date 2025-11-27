/**
 * PRODUCTS - Patrones específicos para productos
 */

export const products = {
    // Item de producto en lista
    item: "flex gap-4 pb-4 border-b border-gray-200 last:border-b-0",

    // Imágenes de producto
    image: "w-20 h-20 object-cover bg-gray-100",
    imageLg: "w-32 h-32 object-cover bg-gray-100",
    imageXl: "w-48 h-48 object-cover bg-gray-100",

    // Nombre del producto
    name: "font-medium text-base mb-1",

    // Metadata (SKU, atributos, etc)
    meta: "text-sm text-gray-500",

    // Precio
    price: "font-medium text-lg",
    priceLarge: "font-bold text-2xl",

    // Badge de stock
    inStock: "inline-block px-2 py-1 text-xs font-medium bg-green-100 border border-green-300 text-green-800",
    outOfStock: "inline-block px-2 py-1 text-xs font-medium bg-red-100 border border-red-300 text-red-800",
    lowStock: "inline-block px-2 py-1 text-xs font-medium bg-yellow-100 border border-yellow-300 text-yellow-800",
};
