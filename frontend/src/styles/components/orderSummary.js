/**
 * ORDER SUMMARY - Componente compuesto para resumen de pedido
 */

import { layout } from '../patterns/layout';

export const orderSummary = {
    container: `${layout.stackSm} text-sm`,
    row: layout.flexBetween,
    label: "text-gray-600",
    value: "font-medium",
    divider: "border-t border-gray-300 pt-3 mt-3",
    total: `${layout.flexBetween} text-base`,
    totalLabel: "font-bold",
    totalValue: "font-bold",
};
