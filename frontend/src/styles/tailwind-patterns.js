/**
 * TAILWIND DESIGN PATTERNS - Sistema de diseño minimalista
 * Extraído de OrderConfirmation.jsx
 * 
 * Uso: import { patterns } from './styles/tailwind-patterns';
 *      <div className={patterns.container}>...</div>
 */

export const patterns = {
    // === LAYOUTS ===
    container: "max-w-4xl mx-auto px-4 py-12",
    containerNarrow: "max-w-2xl mx-auto px-4 py-8",
    containerWide: "max-w-6xl mx-auto px-4 py-12",

    grid2Col: "grid grid-cols-1 lg:grid-cols-3 gap-8",
    gridMain: "lg:col-span-2 space-y-6",
    gridSidebar: "space-y-6",

    // === HEADERS ===
    pageHeader: "border-b-2 border-black pb-8 mb-10",
    pageTitle: "text-3xl font-bold tracking-tight",
    pageSubtitle: "text-gray-600 text-lg mb-2",
    pageDescription: "text-sm text-gray-500 mt-4",

    sectionTitle: "text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300",

    // === BOTONES ===
    btnPrimary: "px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors",
    btnSecondary: "px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors",
    btnOutline: "px-4 py-2 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors",
    btnLink: "text-black underline font-medium hover:no-underline",

    // === TARJETAS / BOXES ===
    cardBordered: "border border-gray-300 p-6",
    cardBorderedLg: "border border-gray-300 p-8",
    cardBackground: "bg-gray-50 border border-gray-300 p-6",
    cardDashed: "border-2 border-dashed border-gray-300 rounded-lg p-6",

    // === ALERTS / STATUS ===
    alertSuccess: "bg-green-50 border border-green-200 p-4 rounded",
    alertSuccessText: "text-sm text-green-800 font-medium",
    alertInfo: "bg-blue-50 border border-blue-200 p-4",
    alertInfoText: "text-sm text-blue-900 font-medium",
    alertWarning: "bg-yellow-50 border border-yellow-200 p-4",
    alertWarningText: "text-sm text-yellow-900 font-medium",

    // === TEXTO ===
    label: "text-xs uppercase tracking-wider text-gray-500 mb-1",
    labelBlock: "text-xs uppercase tracking-wider text-gray-500 mb-2",
    value: "font-medium",
    valueMono: "font-mono text-sm font-medium",

    textMuted: "text-sm text-gray-600",
    textMutedXs: "text-xs text-gray-500",
    textMutedLeading: "text-sm text-gray-600 leading-relaxed",

    // === DIVISORES ===
    divider: "border-t border-gray-300 pt-3",
    dividerLight: "border-t border-gray-200 pt-4",
    dividerSection: "mt-12 pt-8 border-t border-gray-300",

    // === PRODUCTOS / ITEMS ===
    productItem: "flex gap-4 pb-4 border-b border-gray-200 last:border-b-0",
    productImage: "w-20 h-20 object-cover bg-gray-100",
    productImageLg: "w-32 h-32 object-cover bg-gray-100",
    productName: "font-medium text-base mb-1",
    productMeta: "text-sm text-gray-500",

    // === FORMULARIOS ===
    input: "w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors",
    inputError: "w-full px-4 py-2 border-2 border-red-500 focus:outline-none focus:border-red-600",

    // === UPLOAD ===
    uploadZone: "block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors",
    uploadIcon: "mx-auto h-12 w-12 text-gray-400 mb-3",
    uploadText: "text-sm text-gray-600 mb-1",
    uploadTextHighlight: "font-medium text-black",

    // === ICONOS / BADGES ===
    iconBox: "w-6 h-6 border-2 border-black flex items-center justify-center",
    iconCheck: "w-4 h-4",
    badge: "inline-block px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-300",
    badgeSuccess: "inline-block px-2 py-1 text-xs font-medium bg-green-100 border border-green-300 text-green-800",

    // === SPACING ===
    stackSm: "space-y-2",
    stack: "space-y-3",
    stackMd: "space-y-4",
    stackLg: "space-y-6",

    // === FLEXBOX ===
    flexBetween: "flex justify-between",
    flexBetweenCenter: "flex justify-between items-center",
    flexCenter: "flex items-center justify-center",
    flexGap: "flex gap-4",
    flexGapSm: "flex gap-2",
    flexGapLg: "flex gap-6",
};

/**
 * COMPONENTES COMPUESTOS
 * Patrones más complejos que combinan múltiples clases
 */
export const components = {
    // Header con icono de check
    successHeader: () => ({
        container: patterns.pageHeader,
        iconWrapper: "flex items-center gap-3 mb-4",
        icon: patterns.iconBox,
        title: patterns.pageTitle,
        subtitle: patterns.pageSubtitle,
        meta: patterns.pageDescription,
    }),

    // Card con label y valor
    infoCard: () => ({
        card: patterns.cardBordered,
        label: patterns.label,
        value: patterns.value,
        divider: "pt-4 border-t border-gray-200",
    }),

    // Resumen de compra
    orderSummary: () => ({
        container: patterns.stackSm + " text-sm",
        row: patterns.flexBetween,
        label: "text-gray-600",
        value: "font-medium",
        total: patterns.flexBetween + " text-base",
        totalLabel: "font-bold",
        totalValue: "font-bold",
    }),

    // Footer con acciones
    actionFooter: () => ({
        container: patterns.dividerSection,
        buttons: "flex flex-col sm:flex-row gap-4 justify-center mb-8",
        help: "text-center text-sm text-gray-500",
    }),
};

/**
 * UTILIDADES PARA ESTADOS CONDICIONALES
 */
export const states = {
    disabled: "opacity-50 cursor-not-allowed",
    loading: "opacity-75 pointer-events-none",
    active: "bg-black text-white",
    hover: "hover:bg-gray-50 transition-colors",
    focus: "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
};

/**
 * EJEMPLO DE USO:
 * 
 * import { patterns, components, states } from './styles/tailwind-patterns';
 * 
 * // Uso simple
 * <div className={patterns.container}>
 *   <h1 className={patterns.pageTitle}>Título</h1>
 *   <button className={patterns.btnPrimary}>Confirmar</button>
 * </div>
 * 
 * // Uso con componentes compuestos
 * const header = components.successHeader();
 * <div className={header.container}>
 *   <div className={header.iconWrapper}>
 *     <div className={header.icon}>✓</div>
 *     <h1 className={header.title}>Éxito</h1>
 *   </div>
 * </div>
 * 
 * // Combinando con estados
 * <button className={`${patterns.btnPrimary} ${loading ? states.loading : ''}`}>
 *   Procesar
 * </button>
 * 
 * // Combinando múltiples patrones
 * <div className={`${patterns.cardBordered} ${patterns.stack}`}>
 *   <h2 className={patterns.sectionTitle}>Sección</h2>
 *   <p className={patterns.textMuted}>Contenido...</p>
 * </div>
 */
