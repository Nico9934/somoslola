import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
