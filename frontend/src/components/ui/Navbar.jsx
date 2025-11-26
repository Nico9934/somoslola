import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from './Button';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemsCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo izquierda */}
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
                            SOMOSLOLA
                        </Link>
                    </div>

                    {/* Nombre comercial centro */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                        <h1 className="text-3xl font-serif text-primary tracking-wide">
                            LOLA COLLECTION
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Carrito - SIEMPRE visible */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-secondary transition">
                            🛒
                            {itemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {itemsCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    {user.email} {isAdmin && '(Admin)'}
                                </span>

                                {isAdmin ? (
                                    <>
                                        <Link to="/admin" className="text-gray-700 hover:text-secondary transition">
                                            Dashboard
                                        </Link>
                                        <Link to="/admin/products" className="text-gray-700 hover:text-secondary transition">
                                            Productos
                                        </Link>
                                        <Link to="/admin/categories" className="text-gray-700 hover:text-secondary transition">
                                            Categorías
                                        </Link>
                                        <Link to="/admin/orders" className="text-gray-700 hover:text-secondary transition">
                                            Pedidos
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/products" className="text-gray-700 hover:text-secondary transition">
                                            Productos
                                        </Link>
                                        <Link to="/orders" className="text-gray-700 hover:text-secondary transition">
                                            Mis Pedidos
                                        </Link>
                                    </>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="border-primary text-primary hover:bg-primary hover:text-white"
                                >
                                    Salir
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/products" className="text-gray-700 hover:text-secondary transition">
                                    Productos
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                                        Ingresar
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
