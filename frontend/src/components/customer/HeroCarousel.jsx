import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { text, buttons } from '../../styles';

export default function HeroCarousel({ banners }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000); // Cambiar cada 5 segundos

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, banners.length]);

    const handlePrevious = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const goToSlide = (index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Imagen de fondo */}
            <div className="absolute inset-0">
                <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title || 'Banner'}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                        }`}
                />
                {/* Overlay solo si hay texto */}
                {(currentBanner.title || currentBanner.subtitle || currentBanner.link) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                )}
            </div>

            {/* Contenido del banner - Solo mostrar si hay título, subtítulo o link */}
            {(currentBanner.title || currentBanner.subtitle || currentBanner.link) && (
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className={`max-w-2xl transition-all duration-700 ${isTransitioning ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
                        }`}>
                        {/* Título con tipografía moderna estilo Devre */}
                        {currentBanner.title && (
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 leading-none tracking-tight">
                                {currentBanner.title.split(' ').map((word, i) => (
                                    <span
                                        key={i}
                                        className="inline-block"
                                        style={{
                                            animation: `fadeInUp 0.8s ease-out ${i * 0.1}s both`
                                        }}
                                    >
                                        {word}
                                        {i < currentBanner.title.split(' ').length - 1 && ' '}
                                    </span>
                                ))}
                            </h1>
                        )}

                        {/* Subtítulo */}
                        {currentBanner.subtitle && (
                            <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light max-w-xl">
                                {currentBanner.subtitle}
                            </p>
                        )}

                        {/* CTA */}
                        {currentBanner.link && (
                            <a
                                href={currentBanner.link}
                                className={`${buttons.primary} inline-flex items-center rounded-full hover:scale-105 shadow-xl`}
                            >
                                Explorar Ahora
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Controles - Solo mostrar si hay más de 1 banner */}
            {banners.length > 1 && (
                <>
                    {/* Flechas de navegación */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicadores de puntos */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Ir al slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Estilos para animación */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
