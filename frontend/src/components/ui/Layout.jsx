import Navbar from './Navbar';
import Footer from './Footer';
import { FaTruck, FaCreditCard, FaStore, FaWhatsapp } from 'react-icons/fa';
import { text } from '../../styles';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-warm-50 flex flex-col">
            {/* Banner corredizo + Navbar - Posición fija en la parte superior */}
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* Banner corredizo - Desktop: infinite scroll, Mobile: slider */}
                <div className="bg-[#fdf9f3] md:bg-black text-gray-800 md:text-white overflow-hidden">
                    {/* Desktop: Infinite scroll */}
                    <div className="hidden md:flex animate-scroll whitespace-nowrap py-2 items-center gap-8 text-sm font-medium">
                        <span className="inline-flex items-center gap-2">
                            <FaTruck /> ENVIOS GRATIS a TODO el pais con tu compra superior a $149.900 a domicilio y sucursales de Correo Arg. 💗📦
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaCreditCard /> Hasta 3 CUOTAS SIN INTERES! 20% OFF ABONANDO POR TRANSFE!
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaStore /> Pickup Store sin costo en locales
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaWhatsapp /> Atención personalizada por WhatsApp
                        </span>
                        {/* Repetir para efecto continuo */}
                        <span className="inline-flex items-center gap-2">
                            <FaTruck /> Envío gratis a partir de $50.000
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaCreditCard /> Hasta 6 cuotas SIN INTERÉS
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaStore /> Pickup Store sin costo en locales
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FaWhatsapp /> Atención por WhatsApp
                        </span>
                    </div>

                    {/* Mobile: Simple centered text with primary color */}
                    <div className="md:hidden py-2 px-4 text-center text-sm font-medium">
                        <span className="inline-flex items-center justify-center gap-2">
                            <FaTruck /> Envíos gratis +$149.900 💗
                        </span>
                    </div>
                </div>

                <Navbar />
            </div>

            {/* Espaciador para compensar el navbar fijo - Aumentado para mejor separación */}
            <div className="h-[128px]"></div>

            <div className="flex-grow min-h-[calc(96vh-128px)]">
                {children}
            </div>

            {/* Botón flotante de WhatsApp */}
            <a
                href="https://wa.me/542224468167?text=Hola!%20Tengo%20una%20consulta%20sobre%20los%20productos"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-float fixed bottom-6 right-6 bg-green-500/80 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 z-50 flex items-center justify-center backdrop-blur-sm"
                aria-label="Contactar por WhatsApp"
            >
                <FaWhatsapp size={28} />
            </a>

            {/* Footer */}
            <Footer />
        </div>
    );
}
