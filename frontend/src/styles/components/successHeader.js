/**
 * SUCCESS HEADER - Componente compuesto para header con ícono de éxito
 */

import { text } from '../patterns/text';
import { icons } from '../patterns/icons';

export const successHeader = {
    container: text.pageHeader,
    iconWrapper: "flex items-center gap-3 mb-4",
    icon: icons.box,
    title: text.pageTitle,
    subtitle: text.pageSubtitle,
    meta: text.pageDescription,
};
