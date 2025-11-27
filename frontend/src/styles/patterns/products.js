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

    // === PRODUCT CARD (GRID) ===
    productCard: "group bg-white rounded-xs shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-[510px]",
    productCardImageWrap: "relative w-full h-64 bg-gray-50 overflow-hidden flex-shrink-0",
    productCardImage: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
    productCardBody: "p-4 flex flex-col flex-1",
    productCardCategory: "text-xs text-gray-500",
    productCardName: "text-base font-medium text-gray-900 line-clamp-2 min-h-[3rem]",
    productCardPrice: "text-lg font-semibold",
    productCardPriceOld: "text-sm text-gray-400 line-through",
    productCardBadge: "absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-xs",
    productCardFavBtn: "absolute top-3 right-3 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition",
    productCardColors: "flex items-center gap-1 pt-1",
    productCardColorDot: "w-4 h-4 rounded-full border border-gray-300",
    productCardAddBtn: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition",
    productCardFooter: "mt-auto pt-3 border-t border-gray-100 space-y-2",
    productCardTransferPrice: "text-sm text-green-600 font-medium",
    productCardInstallments: "text-xs text-gray-500",
};
