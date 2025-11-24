export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    const baseStyles = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-secondary hover:bg-secondary-dark text-white',
        secondary: 'bg-primary hover:bg-primary-light text-white',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-primary hover:bg-gray-100',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
