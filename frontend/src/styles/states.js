/**
 * STATES - Estados condicionales para componentes
 */

export const states = {
    // Disabled
    disabled: "opacity-50 cursor-not-allowed",

    // Loading
    loading: "opacity-75 pointer-events-none",

    // Active/Selected
    active: "bg-black text-white",

    // Hover
    hover: "hover:bg-gray-50 transition-colors",
    hoverDark: "hover:bg-gray-800 transition-colors",

    // Focus
    focus: "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",

    // Hidden
    hidden: "hidden",
    visible: "block",
};
