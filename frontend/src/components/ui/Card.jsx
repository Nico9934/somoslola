import { cards } from '../../styles';

export default function Card({ children, className = '', hover = false, variant = 'bordered' }) {
    // Mapeo de variantes
    const variantMap = {
        bordered: cards.bordered,
        background: cards.background,
        shadow: cards.shadow,
        interactive: cards.interactive,
    };

    const baseClass = variantMap[variant] || variantMap.bordered;
    const hoverClass = hover ? 'hover:shadow-lg transition-shadow' : '';

    return (
        <div className={`${baseClass} ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}
