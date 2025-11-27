/**
 * LAYOUT - Patrones de estructura y espaciado
 */

export const layout = {
    // === CONTENEDORES ===
    container: "max-w-4xl mx-auto px-4 py-12",
    containerNarrow: "max-w-2xl mx-auto px-4 py-8",
    containerWide: "max-w-6xl mx-auto px-4 py-12",
    containerXWide: "max-w-7xl mx-auto px-4 py-12",
    containerFluid: "w-full px-4 py-12",

    // === GRIDS ===
    grid2Col: "grid grid-cols-1 lg:grid-cols-3 gap-8",
    gridMain: "lg:col-span-2 space-y-6",
    gridSidebar: "space-y-6",

    grid3Col: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    grid4Col: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",

    // === FLEXBOX ===
    flexBetween: "flex justify-between",
    flexBetweenCenter: "flex justify-between items-center",
    flexCenter: "flex items-center justify-center",
    flexGap: "flex gap-4",
    flexGapSm: "flex gap-2",
    flexGapLg: "flex gap-6",

    // === SPACING VERTICAL ===
    stackSm: "space-y-2",
    stack: "space-y-3",
    stackMd: "space-y-4",
    stackLg: "space-y-6",
    stackXl: "space-y-8",

    // === DIVISORES ===
    divider: "border-t border-gray-300 pt-3",
    dividerLight: "border-t border-gray-200 pt-4",
    dividerSection: "mt-12 pt-8 border-t border-gray-300",
    dividerDark: "border-t-2 border-black pt-4",
};
