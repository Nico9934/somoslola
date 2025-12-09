import { buttons, states } from '../../styles';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    ...props
}) {
    // Mapeo de variantes a nuestro sistema de diseño
    const variantMap = {
        primary: buttons.primary,
        secondary: buttons.secondary,
        outline: buttons.outline,
        ghost: 'text-black hover:bg-gray-100 transition-colors rounded-none',
        danger: 'px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors rounded-none',
    };

    // Mapeo de tamaños
    const sizeMap = {
        sm: buttons.sm,
        md: buttons.md,
        lg: buttons.lg,
    };

    const variantClass = variantMap[variant] || variantMap.primary;
    const sizeClass = sizeMap[size] || sizeMap.md;
    const disabledClass = disabled ? states.disabled : '';

    return (
        <button
            className={`${variantClass} ${sizeClass} ${disabledClass} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
