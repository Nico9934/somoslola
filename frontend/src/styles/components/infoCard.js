/**
 * INFO CARD - Componente compuesto para cards de información
 */

import { cards } from '../patterns/cards';
import { text } from '../patterns/text';

export const infoCard = {
    card: cards.bordered,
    label: text.label,
    value: text.value,
    divider: "pt-4 border-t border-gray-200",
};
