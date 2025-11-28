import { badges, products as productStyles } from '../../styles';

/**
 * Componente para mostrar precios con diferentes opciones de pago
 * - Precio de lista (salePrice)
 * - Precio transferencia (calculado por backend)
 * - Cuotas sin interés (calculado por backend)
 * 
 * IMPORTANTE: Todos los cálculos vienen del backend para garantizar
 * consistencia en el checkout y evitar manipulación de precios.
 */
export default function PriceDisplay({
    salePrice,
    transferPrice,
    installmentPrice,
    promotionPrice,
    paymentOptions = { installments: 3, transferDiscount: 20 },
    showInstallments = true
}) {
    // Si hay precio promocional, usarlo como base
    const basePrice = promotionPrice || salePrice;
    const hasPromotion = !!promotionPrice;

    return (
        <div className="space-y-3">
            {/* Precio de Lista */}
            {hasPromotion && (
                <div className="flex items-center gap-2">
                    <span className={`${productStyles.meta} line-through`}>
                        ${salePrice.toLocaleString('es-AR')}
                    </span>
                    <span className={badges.error}>
                        -{Math.round(((salePrice - promotionPrice) / salePrice) * 100)}% OFF
                    </span>
                </div>
            )}

            {/* Precio Principal (Lista o Promoción) */}
            <div className="flex items-baseline gap-2">
                <span className={`text-3xl ${productStyles.price}`}>
                    ${basePrice.toLocaleString('es-AR')}
                </span>
                {!hasPromotion && (
                    <span className={productStyles.meta}>Precio de lista</span>
                )}
            </div>

            {/* Precio Transferencia (20% off) - Minimalista */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-700 font-medium">
                            💳 Precio transferencia ({paymentOptions.transferDiscount}% OFF)
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            ${transferPrice.toLocaleString('es-AR')}
                        </p>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Ahorrás ${(basePrice - transferPrice).toLocaleString('es-AR')}
                    </div>
                </div>
            </div>

            {/* Cuotas sin interés - Minimalista */}
            {showInstallments && paymentOptions.installmentsActive && installmentPrice && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                    <p className="text-sm text-gray-700 font-medium mb-1">
                        💰 {paymentOptions.installments} cuotas sin interés
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                        {paymentOptions.installments} x ${installmentPrice.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Total: ${(installmentPrice * paymentOptions.installments).toLocaleString('es-AR')}
                    </p>
                </div>
            )}
        </div>
    );
}
