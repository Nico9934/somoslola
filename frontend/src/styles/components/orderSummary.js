/**
 * ORDER SUMMARY - Componente compuesto para resumen de pedido
 */

import { layout } from '../patterns/layout';

export const orderSummary = {
    container: `${layout.stackSm} text-sm`,
    row: `${layout.flexBetween} py-2`,
    label: "text-gray-600",
    value: "font-medium text-gray-900",
    divider: "border-t border-gray-200 my-3",
    totalRow: `${layout.flexBetween} pt-3 text-lg`,
    totalLabel: "font-bold text-gray-900",
    totalValue: "font-bold text-gray-900",
};
