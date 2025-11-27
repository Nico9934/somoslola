import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { buttons, text } from '../../styles';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemsCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClass = "text-gray-700 hover:text-black transition-colors";

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo izquierda */}
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-800 transition-colors">
                            SOMOSLOLA
                        </Link>
                    </div>

                    {/* Nombre comercial centro */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                        <h1 className="text-3xl font-serif text-black tracking-wide">
                            LOLA COLLECTION
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Carrito - SIEMPRE visible */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-black transition">
                            🛒
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
                </div>
            </div>
        </nav>
    );
}
