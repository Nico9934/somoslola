/**
 * ACTION FOOTER - Componente compuesto para footer con acciones
 */

import { layout } from '../patterns/layout';

export const actionFooter = {
    container: layout.dividerSection,
    buttons: "flex flex-col sm:flex-row gap-4 justify-center mb-8",
    help: "text-center text-sm text-gray-500",
};
