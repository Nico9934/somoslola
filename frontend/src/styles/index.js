/**
 * DESIGN SYSTEM - Sistema de diseño minimalista
 * 
 * Uso:
 * import { buttons, cards, layout, text } from '@/styles';
 * import { orderSummary, successHeader } from '@/styles/components';
 * import { states } from '@/styles';
 */

// === PATTERNS ===
// Importar todos de una vez para mejor tree-shaking
import { buttons } from './patterns/buttons.js';
import { cards } from './patterns/cards.js';
import { inputs } from './patterns/inputs.js';
import { layout } from './patterns/layout.js';
import { text } from './patterns/text.js';
import { alerts } from './patterns/alerts.js';
import { products } from './patterns/products.js';
import { upload } from './patterns/upload.js';
import { badges } from './patterns/badges.js';
import { icons } from './patterns/icons.js';

// === COMPONENTS ===
import { orderSummary } from './components/orderSummary.js';
import { successHeader } from './components/successHeader.js';
import { infoCard } from './components/infoCard.js';
import { actionFooter } from './components/actionFooter.js';

// === STATES ===
import { states } from './states.js';

// Export como objeto único para mejor bundling
export {
    // Patterns
    buttons,
    cards,
    inputs,
    layout,
    text,
    alerts,
    products,
    upload,
    badges,
    icons,
    // Components
    orderSummary,
    successHeader,
    infoCard,
    actionFooter,
    // States
    states
};
