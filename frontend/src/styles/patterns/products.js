/**
 * PRODUCTS - Estilos renovados estilo TiendaNube
 */

export const products = {

    /* ============================================================
       LIST ITEM (vista lista)
    ============================================================ */
    item: "flex gap-4 pb-4 border-b border-gray-200 last:border-b-0",
    image: "w-20 h-20 object-cover bg-gray-100 rounded-md",
    imageLg: "w-32 h-32 object-cover bg-gray-100 rounded-md",
    imageXl: "w-48 h-48 object-cover bg-gray-100 rounded-md",


    /* ============================================================
       TEXT
    ============================================================ */
    name: "font-medium text-base text-gray-900",
    meta: "text-sm text-gray-500",
    price: "text-lg font-semibold text-gray-900",
    priceLarge: "text-2xl font-bold text-gray-900",


    /* ============================================================
       BADGES
    ============================================================ */
    inStock: "inline-block px-2 py-1 text-xs font-medium bg-green-50 border border-green-200 text-green-700 rounded",
    outOfStock: "inline-block px-2 py-1 text-xs font-medium bg-red-50 border border-red-200 text-red-700 rounded",
    lowStock: "inline-block px-2 py-1 text-xs font-medium bg-yellow-50 border border-yellow-200 text-yellow-700 rounded",

    /* Badge floating como TiendaNube */
    badgeFloating: "absolute top-3 left-3 bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-md backdrop-blur-sm shadow-md",


    /* ============================================================
       PRODUCT CARD (ESTILO TIENDANUBE)
    ============================================================ */

    /* Contenedor principal */
    productCard:
        "group bg-white rounded-lg border border-gray-200 overflow-hidden " +
        "shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer",

    /* Contenedor que mantiene la proporción de imagen */
    productCardImageWrap:
        "relative w-full overflow-hidden bg-gray-100 " +
        "before:block before:content-[''] before:pb-[100%] rounded-lg",

    /* Imagen con fade-in + scale on hover */
    productCardImage:
        "absolute top-0 left-0 w-full h-full object-contain " +
        "opacity-100 scale-[1.0] transition-all duration-700 ease-out " +
        "group-hover:scale-105",

    /* Cuerpo de la tarjeta */
    productCardBody: "p-3 flex flex-col gap-2",

    /* Categoría */
    productCardCategory: "text-[11px] uppercase tracking-wide text-gray-400",

    /* Nombre del producto */
    productCardName: "text-[15px] font-medium text-gray-900 leading-snug line-clamp-2 min-h-[40px]",

    /* Precios */
    productCardPrice: "text-[18px] font-semibold text-gray-900",
    productCardPriceOld: "text-sm text-gray-400 line-through",

    /* Badge floating (OFERTA / SIN STOCK) */
    productCardBadge:
        "absolute top-3 left-3 bg-black text-white text-xs font-medium px-3 py-1 rounded-md shadow-sm",

    /* Botón favorito (esquina superior derecha) */
    productCardFavBtn:
        "absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm opacity-0 " +
        "group-hover:opacity-100 transition",

    /* Colores (puntitos) */
    productCardColors: "flex items-center gap-1 mt-1",
    productCardColorDot: "w-4 h-4 rounded-full border border-gray-300 shadow-sm",

    /* Botón “Agregar al carrito” estilo TN */
    productCardAddBtn:
        "w-full mt-3 bg-black text-white text-sm py-2 rounded-md " +
        "opacity-0 group-hover:opacity-100 transition-colors hover:bg-gray-800",

    /* Footer informativo (cuotas, transferencia) */
    productCardFooter:
        "mt-auto pt-3 border-t border-gray-100 space-y-1 text-[13px] text-gray-700",

    productCardTransferPrice: "text-[13px] text-green-600 font-medium",
    productCardInstallments: "text-[12px] text-gray-500",
};
