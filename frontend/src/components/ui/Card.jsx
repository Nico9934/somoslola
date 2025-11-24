export default function Card({ children, className = '', hover = false }) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md p-6 ${hover ? 'transition-shadow hover:shadow-lg' : ''
                } ${className}`}
        >
            {children}
        </div>
    );
}
