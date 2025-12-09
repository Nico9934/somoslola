/**
 * BUTTONS - Patrones de botones minimalistas
 */

export const buttons = {
    // Botón primario - Negro sólido con bordes cuadrados, hover con borde (border transparente para evitar salto)
    primary: "px-6 py-3 bg-black text-white font-medium rounded-none border border-transparent hover:bg-warm-50 hover:text-black hover:border-black transition-all duration-300",

    // Botón secundario - Borde con fondo cálido en hover
    secondary: "px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-none hover:border-black hover:bg-warm-50 transition-all duration-300",

    // Botón outline - Borde sutil (border transparente en estado normal para evitar salto)
    outline: "px-4 py-2 border border-gray-200 text-gray-600 rounded-none hover:border-black hover:bg-warm-50 transition-all duration-300",

    // Link estilizado
    link: "text-gray-700 underline font-medium hover:text-gray-900 hover:no-underline transition-colors",

    // Variantes de tamaño
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",

    // Botón de ancho completo
    full: "w-full",
};
