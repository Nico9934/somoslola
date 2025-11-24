import Navbar from './Navbar';
import { FaTruck, FaCreditCard, FaStore, FaWhatsapp } from 'react-icons/fa';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-background-dark">
            {/* Banner corredizo */}
            <div className="bg-primary text-white overflow-hidden">
                <div className="animate-scroll whitespace-nowrap py-2 flex items-center gap-8 text-sm">
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
