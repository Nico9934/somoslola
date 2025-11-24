import { Search, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function AdminPageLayout({
    title,
    searchTerm = '',
    onSearchChange,
    searchPlaceholder = 'Buscar...',
    onCreateClick,
    createButtonLabel = 'Crear',
    showSearch = true,
    showCreateButton = true,
    filters,
    children,
}) {
    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex-none bg-white border-b border-gray-200 p-4 md:p-6 sticky top-0 z-20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {showSearch && onSearchChange && (
                            <div className="relative flex-1 sm:min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={onSearchChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                                />
                            </div>
                        )}

                        {showCreateButton && onCreateClick && (
                            <Button onClick={onCreateClick} className="flex items-center gap-2 whitespace-nowrap">
                                <Plus className="h-4 w-4" />
                                {createButtonLabel}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters row */}
                {filters && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        {filters}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
                {children}
            </div>
        </div>
    );
}
