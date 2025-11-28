import Navbar from './Navbar';
import { FaTruck, FaCreditCard, FaStore, FaWhatsapp } from 'react-icons/fa';
import { text } from '../../styles';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner corredizo + Navbar - Posición fija en la parte superior */}
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* Banner corredizo */}
                <div className="bg-black text-white overflow-hidden">
                    <div className="animate-scroll whitespace-nowrap py-2 flex items-center gap-8 text-sm font-medium">
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
                </div>

                <Navbar />
            </div>

            {/* Espaciador para compensar el navbar fijo - Aumentado para mejor separación */}
            <div className="h-[128px]"></div>

            {children}
        </div>
    );
}
