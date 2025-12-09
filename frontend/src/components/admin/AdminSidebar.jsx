import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    X,
    Menu,
    Truck,
    Tag,
    Image,
    CreditCard,
    Bell
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { text, buttons, badges } from '../../styles';

const navigation = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Productos', href: '/admin/products', icon: Package },
    { label: 'Categorías', href: '/admin/categories', icon: FolderTree },
    { label: 'Marcas', href: '/admin/brands', icon: Tag },
    { label: 'Atributos', href: '/admin/attributes', icon: FolderTree },
    { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Notificaciones Stock', href: '/admin/stock-notifications', icon: Bell },
    { label: 'Zonas de Envío', href: '/admin/shipping-zones', icon: Truck },
    { label: 'Hero Banners', href: '/admin/hero-banners', icon: Image },
    { label: 'Config. Pagos', href: '/admin/payment-settings', icon: CreditCard },
];

export default function AdminSidebar({ variant = 'desktop' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isMobile = variant === 'mobile';
    const isExpanded = isPinned || isHovered || isMobile;

    useEffect(() => {
        if (variant === 'desktop') {
            const saved = localStorage.getItem('adminSidebarPinned');
            if (saved !== null) {
                setIsPinned(saved === 'true');
            }
        }
    }, [variant]);

    const togglePin = () => {
        if (variant !== 'desktop') return;
        const newPinned = !isPinned;
        setIsPinned(newPinned);
        localStorage.setItem('adminSidebarPinned', newPinned.toString());
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile menu button */}
            {isMobile && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-4 left-4 z-40 md:hidden shadow-md rounded-full bg-white"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            )}

            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm',
                    isMobile
                        ? cn(
                            'fixed top-0 bottom-0 left-0 z-40 min-h-screen',
                            'w-72',
                            isOpen ? 'translate-x-0' : '-translate-x-full'
                        )
                        : cn(
                            'sticky top-0 h-screen',
                            isExpanded ? 'w-64' : 'w-16'
                        )
                )}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0',
                            !isExpanded && 'mx-auto'
                        )}>
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        {isExpanded && (
                            <div>
                                <h1 className="text-lg font-bold text-black tracking-wide">LOLA</h1>
                                <p className="text-xs text-gray-500">Panel Admin</p>
                            </div>
                        )}
                    </div>

                    {!isMobile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePin}
                            className="text-gray-600 hover:bg-gray-100 hidden md:flex"
                        >
                            {isPinned ? (
                                <ChevronLeft className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;

                            return (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center rounded-lg px-3 py-3 transition-all',
                                        text.body,
                                        !isExpanded && 'justify-center',
                                        isActive
                                            ? 'bg-black text-white font-semibold shadow-sm'
                                            : 'text-gray-700 hover:bg-warm-50 hover:text-black font-medium'
                                    )}
                                    onClick={() => {
                                        if (isMobile) setIsOpen(false);
                                    }}
                                >
                                    <Icon className={cn('h-5 w-5 flex-shrink-0', isExpanded && 'mr-3')} />
                                    {isExpanded && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 p-3 space-y-2">
                    {/* User info */}
                    <div className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-warm-50',
                        !isExpanded && 'justify-center'
                    )}>
                        <User className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        {isExpanded && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-black truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">Administrador</p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={cn(
                            'w-full text-gray-600 flex items-center justify-center hover:text-red-600 hover:bg-red-50 transition-colors',
                            text.body,
                            !isExpanded ? 'justify-center px-0' : 'justify-start gap-3'
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {isExpanded && <span>Cerrar Sesión</span>}
                    </Button>

                    {/* Version */}
                    {isExpanded && (
                        <p className="text-xs text-gray-400 text-center pt-2">
                            v1.0.0
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
}
