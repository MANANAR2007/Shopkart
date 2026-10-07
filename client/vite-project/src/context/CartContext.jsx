/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCartData = useCallback(async () => {
        try {
            const response = await api.get('/cart')
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart)
            } else {
                setCartItems([])
            }
            setError(null)
        } catch (err) {
            if (err.response?.status === 401) {
                setCartItems([])
                setError(null)
            } else {
                setError(err.response?.data?.message || 'Unable to load your cart.')
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshCart = useCallback(async () => {
        setLoading(true)
        await fetchCartData()
    }, [fetchCartData])

    useEffect(() => {
        let isMounted = true

        const initialLoad = async () => {
            try {
                const response = await api.get('/cart')
                if (isMounted) {
                    if (response.data && Array.isArray(response.data.cart)) {
                        setCartItems(response.data.cart)
                    } else {
                        setCartItems([])
                    }
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        setCartItems([])
                        setError(null)
                    } else {
                        setError(err.response?.data?.message || 'Unable to load your cart.')
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initialLoad()

        return () => {
            isMounted = false
        }
    }, [])

    const addToCart = async (productId) => {
        try {
            const response = await api.post(`/cart/${productId}`)
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart)
            }
            return {
                success: true,
                message: response.data?.message || 'Product added to cart',
                cart: response.data?.cart
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add product to cart'
            return {
                success: false,
                message
            }
        }
    }

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await api.patch(`/cart/${productId}`, { quantity })
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart)
            }
            return {
                success: true,
                message: response.data?.message || 'Cart updated',
                cart: response.data?.cart
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update quantity'
            return {
                success: false,
                message
            }
        }
    }

    const removeFromCart = async (productId) => {
        try {
            const response = await api.delete(`/cart/${productId}`)
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart)
            }
            return {
                success: true,
                message: response.data?.message || 'Item removed from cart',
                cart: response.data?.cart
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to remove item'
            return {
                success: false,
                message
            }
        }
    }

    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
    }, [cartItems])

    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const price = Number(item.product?.price) || 0
            const qty = Number(item.quantity) || 0
            return acc + price * qty
        }, 0)
    }, [cartItems])

    const clearCart = useCallback(() => {
        setCartItems([])
    }, [])

    const value = {
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export { CartContext }
export default CartProvider
