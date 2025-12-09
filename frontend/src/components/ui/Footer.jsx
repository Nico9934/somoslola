import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
    const categories = [
        { name: 'Remeras', id: 29 },
        { name: 'Pantalones', id: 30 },
        { name: 'Camperas', id: 31 },
        { name: 'Buzos', id: 32 },
        { name: 'Accesorios', id: 33 }
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo y descripción */}
                    <div>
                        <Link to="/" className="inline-block mb-4">
                            <img src="/Logo.png" alt="LOLA COLLECTION" className="h-12 brightness-0 invert" />
                        </Link>
                        <p className="text-sm text-gray-400 mb-4">
                            Moda y estilo para cada momento. Calidad y diseño en cada prenda.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/somoslola"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-pink-500 transition-colors"
                                aria-label="Instagram"
                            >
                                <FaInstagram size={24} />
                            </a>
                            <a
                                href="https://wa.me/542224468167"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-green-500 transition-colors"
                                aria-label="WhatsApp"
                            >
                                <FaWhatsapp size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Categorías */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Categorías</h3>
                        <ul className="space-y-2">
                            {categories.map(category => (
                                <li key={category.id}>
                                    <Link
                                        to="/products"
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Información */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Información</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Carrito
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Mis Pedidos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <FaWhatsapp className="mt-1 flex-shrink-0" />
                                <a href="https://wa.me/542224468167" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    +54 9 222 446-8167
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <FaInstagram className="mt-1 flex-shrink-0" />
                                <a href="https://www.instagram.com/somoslola" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    @somoslola_
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                                <span>Mar del Plata, Argentina</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} LOLA COLLECTION. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <span className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</span>
                            <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidad</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
