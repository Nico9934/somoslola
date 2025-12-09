import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { buttons, text } from '../../styles';
import { FaShoppingCart } from 'react-icons/fa';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemsCount } = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const linkClass = "text-gray-600 hover:text-black transition-all duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-200 hover:after:w-full";
    const mobileLinkClass = "block py-2 text-gray-600 hover:bg-warm-50 px-4 rounded-lg transition-colors";

    return (
        <nav className="bg-white/98 backdrop-blur-sm shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo - Desktop: izquierda, Mobile: centro */}
                    <div className="flex items-center w-32 h-auto md:static absolute left-1/2 transform -translate-x-1/2 md:translate-x-0">
                        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-800 transition-colors">
                            <img src="/Logo.png" alt="LOLA COLLECTION Logo" className="w-full h-auto" />
                        </Link>
                    </div>

                    {/* Nombre comercial centro - Solo desktop */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block pointer-events-none">
                        <h1 className="text-3xl font-serif text-black tracking-wide">

                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Carrito - SIEMPRE visible */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-black transition-all duration-200 hover:scale-110">
                            <FaShoppingCart size={20} />
                            {itemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {itemsCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <span className={text.muted}>
                                    {user.email} {isAdmin && '(Admin)'}
                                </span>

                                {isAdmin ? (
                                    <>
                                        <Link to="/admin" className={linkClass}>
                                            Dashboard
                                        </Link>
                                        <Link to="/admin/products" className={linkClass}>
                                            Productos
                                        </Link>
                                        <Link to="/admin/categories" className={linkClass}>
                                            Categorías
                                        </Link>
                                        <Link to="/admin/orders" className={linkClass}>
                                            Pedidos
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/products" className={linkClass}>
                                            Productos
                                        </Link>
                                        <Link to="/orders" className={linkClass}>
                                            Mis Pedidos
                                        </Link>
                                    </>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className={`${buttons.outline} ${buttons.sm}`}
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/products" className={linkClass}>
                                    Productos
                                </Link>
                                <Link to="/login">
                                    <button className={`${buttons.outline} ${buttons.sm}`}>
                                        Ingresar
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button & Cart */}
                    <div className="flex md:hidden items-center gap-3">
                        {/* Carrito - SIEMPRE visible en mobile */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-black transition">
                            🛒
                            {itemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {itemsCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-700 hover:text-black transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-[200] md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Drawer */}
                    <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl z-[210] md:hidden overflow-y-auto animate-slideInRight">
                        <div className="p-4">
                            {/* Close button */}
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-700 hover:text-black transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* User info */}
                            {user && (
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium">
                                        {user.email}
                                    </p>
                                    {isAdmin && (
                                        <p className="text-xs text-blue-600 mt-1">Admin</p>
                                    )}
                                </div>
                            )}

                            {/* Navigation Links */}
                            <nav className="space-y-2">
                                {user ? (
                                    <>
                                        {isAdmin ? (
                                            <>
                                                <Link
                                                    to="/admin"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/admin/products"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Productos
                                                </Link>
                                                <Link
                                                    to="/admin/categories"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Categorías
                                                </Link>
                                                <Link
                                                    to="/admin/orders"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Pedidos
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/products"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Productos
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    className={mobileLinkClass}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Mis Pedidos
                                                </Link>
                                            </>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Salir
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/products"
                                            className={mobileLinkClass}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Productos
                                        </Link>
                                        <Link
                                            to="/login"
                                            className={mobileLinkClass}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Ingresar
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
