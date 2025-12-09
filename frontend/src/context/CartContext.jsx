import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const loadUserCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.createOrGet();
            localStorage.setItem('cartId', data.id);
            setCart(data);
        } catch (error) {
            console.error('Error loading user cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCart = useCallback(async (cartId) => {
        try {
            setLoading(true);
            const data = await cartService.getById(cartId);
            setCart(data);
        } catch (error) {
            console.error('Error loading cart:', error);
            localStorage.removeItem('cartId');
        } finally {
            setLoading(false);
        }
    }, []);

    // Nuevo método para forzar recarga del carrito (útil al abrir el drawer)
    const refreshCart = useCallback(async () => {
        const cartId = localStorage.getItem('cartId');
        if (cartId) {
            await loadCart(cartId);
        }
    }, [loadCart]);

    // Cargar carrito inicial desde localStorage
    useEffect(() => {
        const cartId = localStorage.getItem('cartId');
        if (cartId) {
            loadCart(cartId);
        }
    }, [loadCart]);

    // Recargar carrito cuando el usuario se autentica
    useEffect(() => {
        if (user) {
            // Usuario autenticado - buscar su carrito
            loadUserCart();
        }
    }, [user]);

    const createCart = async () => {
        try {
            const data = await cartService.createOrGet();
            localStorage.setItem('cartId', data.id);
            setCart(data);
            return data;
        } catch (error) {
            console.error('Error creating cart:', error);
        }
    };

    const addItem = async (variantId, quantity = 1) => {
        try {
            let currentCart = cart;
            if (!currentCart) {
                currentCart = await createCart();
            }

            await cartService.addItem(currentCart.id, variantId, quantity);
            await loadCart(currentCart.id);
        } catch (error) {
            console.error('Error adding item:', error);
            throw error;
        }
    };

    const updateItem = async (variantId, quantity) => {
        try {
            await cartService.updateItem(cart.id, variantId, quantity);
            await loadCart(cart.id);
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    };

    const removeItem = async (variantId) => {
        try {
            await cartService.removeItem(cart.id, variantId);
            await loadCart(cart.id);
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        }
    };

    const clearCart = () => {
        localStorage.removeItem('cartId');
        setCart(null);
    };

    const itemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addItem,
            updateItem,
            removeItem,
            clearCart,
            loadCart,
            refreshCart,
            itemsCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
