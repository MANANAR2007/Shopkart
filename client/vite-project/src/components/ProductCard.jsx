import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product, isWishlisted = false, onWishlistChange }) => {
    const inStock = Number(product.stock) > 0
    const [localWishlisted, setLocalWishlisted] = useState(null)
    const [saving, setSaving] = useState(false)
    const [adding, setAdding] = useState(false)
    const [updatingQty, setUpdatingQty] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [cartMessage, setCartMessage] = useState('')

    const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart()
    const cartItem = cartItems.find((item) => item.product?._id === product._id)
    const inCartQty = cartItem ? cartItem.quantity : 0

    const wishlisted = localWishlisted !== null ? localWishlisted : isWishlisted

    
    const handleWishlistToggle = async () => {
        if (saving) return

        setSaving(true)
        setErrorMessage('')

        try {
            const response = await api.patch(`/wishlist/${product._id}/toggle`)
            const nextStatus = response.data?.wishlisted ?? !wishlisted
            setLocalWishlisted(nextStatus)

            window.dispatchEvent(new Event('wishlistUpdated'))

            if (onWishlistChange) {
                onWishlistChange(product._id, nextStatus)
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to update wishlist')
            setTimeout(() => setErrorMessage(''), 3000)
        } finally {
            setSaving(false)
        }
    }

    const handleAddToCart = async () => {
        if (adding || !inStock) return

        setAdding(true)
        setErrorMessage('')
        setCartMessage('')

        const result = await addToCart(product._id)
        if (result.success) {
            setCartMessage('✓ Added to cart!')
            setTimeout(() => setCartMessage(''), 2500)
        } else {
            setErrorMessage(result.message || 'Failed to add to cart')
            setTimeout(() => setErrorMessage(''), 3000)
        }
        setAdding(false)
    }

    const handleRemoveFromCart = async () => {
        if (updatingQty) return

        setUpdatingQty(true)
        setErrorMessage('')
        setCartMessage('')

        const result = await removeFromCart(product._id)
        if (result.success) {
            setCartMessage('✓ Removed from cart')
            setTimeout(() => setCartMessage(''), 2000)
        } else {
            setErrorMessage(result.message || 'Failed to remove from cart')
            setTimeout(() => setErrorMessage(''), 3000)
        }
        setUpdatingQty(false)
    }

    const handleQuantityChange = async (newQty) => {
        const maxStock = Number(product.stock) || 0
        if (updatingQty) return

        if (newQty < 1) {
            await handleRemoveFromCart()
            return
        }

        if (newQty > maxStock) return

        setUpdatingQty(true)
        setErrorMessage('')

        const result = await updateQuantity(product._id, newQty)
        if (!result.success) {
            setErrorMessage(result.message || 'Failed to update quantity')
            setTimeout(() => setErrorMessage(''), 3000)
        }
        setUpdatingQty(false)
    }

    return (
        <div className="product-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
            {/* Product Image */}
            <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-700 rounded-md shadow-xs">
                    {product.category}
                </span>
            </div>

            {/* Product Information */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h2 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">
                        Category: {product.category}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 block">Price</span>
                        <p className="text-lg font-extrabold text-slate-900">
                            ₹{product.price}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-slate-400 block">Status</span>
                        <p
                            className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                                inStock
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-rose-700 bg-rose-50'
                            }`}
                        >
                            {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </p>
                    </div>
                </div>

                {/* Feedback Messages */}
                {cartMessage && (
                    <p className="text-[11px] text-emerald-600 mt-2 text-center font-bold">
                        {cartMessage}
                    </p>
                )}
                {errorMessage && (
                    <p className="text-[11px] text-rose-600 mt-2 text-center font-medium">
                        {errorMessage}
                    </p>
                )}

                {/* Actions: Add to Cart, View Details, and Wishlist Toggle */}
                <div className="mt-4 space-y-2">
                    {inCartQty > 0 ? (
                        <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 p-1 shadow-xs">
                            <button
                                type="button"
                                disabled={updatingQty}
                                onClick={() => handleQuantityChange(inCartQty - 1)}
                                className="w-9 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-all hover:bg-white hover:text-indigo-600 hover:shadow-xs active:scale-95 cursor-pointer text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                title={inCartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                            >
                                -
                            </button>

                            <span className="text-sm font-extrabold text-slate-900 text-center">
                                {updatingQty ? '...' : inCartQty}
                            </span>

                            <button
                                type="button"
                                disabled={inCartQty >= Number(product.stock) || updatingQty}
                                onClick={() => handleQuantityChange(inCartQty + 1)}
                                className={`w-9 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-all ${
                                    inCartQty >= Number(product.stock) || updatingQty
                                        ? 'opacity-40 cursor-not-allowed text-slate-400'
                                        : 'hover:bg-indigo-600 hover:text-white hover:shadow-xs active:scale-95 cursor-pointer text-slate-700'
                                }`}
                                title={inCartQty >= Number(product.stock) ? 'Maximum available stock reached' : 'Increase quantity'}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!inStock || adding}
                            className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                !inStock
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                    : adding
                                      ? 'bg-indigo-400 text-white cursor-wait'
                                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-xs'
                            }`}
                        >
                            {adding ? (
                                <span>Adding...</span>
                            ) : !inStock ? (
                                <span>Out of Stock</span>
                            ) : (
                                <span>Add to Cart</span>
                            )}
                        </button>
                    )}

                    <Link
                        to={`/products/${product._id}`}
                        className="block w-full py-2.5 text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        onClick={handleWishlistToggle}
                        disabled={saving}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            saving
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : wishlisted
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50'
                        }`}
                    >
                        {saving ? (
                            <span>⏳ Updating...</span>
                        ) : wishlisted ? (
                            <span>♥ Remove from Wishlist</span>
                        ) : (
                            <span>♡ Add to Wishlist</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
