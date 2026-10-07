import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [addedNotification, setAddedNotification] = useState(false)
    const [wishlisted, setWishlisted] = useState(false)
    const [wishlistSaving, setWishlistSaving] = useState(false)
    const [wishlistMessage, setWishlistMessage] = useState('')
    const [addingToCart, setAddingToCart] = useState(false)
    const [updatingQty, setUpdatingQty] = useState(false)
    const [cartError, setCartError] = useState('')

    const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart()
    const cartItem = cartItems.find((item) => item.product?._id === id)
    const inCartQty = cartItem ? cartItem.quantity : 0

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await api.get(`/products/${id}`)
                setProduct(response.data.product || response.data)

                try {
                    const wishRes = await api.get('/wishlist')
                    if (wishRes.data?.wishlist) {
                        const isInWishlist = wishRes.data.wishlist.some(
                            (item) => item._id === id
                        )
                        setWishlisted(isInWishlist)
                    }
                } catch {
                    // Ignore wishlist check error
                }
            } catch (err) {
                console.error('Error fetching product details:', err)
                setError('Product not found or failed to load.')
            } finally {
                setLoading(false)
            }
        }

        fetchProductAndWishlist()
    }, [id])

    const handleWishlistToggle = async () => {
        if (wishlistSaving) return

        setWishlistSaving(true)
        setWishlistMessage('')

        try {
            const response = await api.patch(`/wishlist/${id}/toggle`)
            const nextStatus = response.data?.wishlisted ?? !wishlisted
            setWishlisted(nextStatus)
            setWishlistMessage(nextStatus ? 'Added to wishlist!' : 'Removed from wishlist')

            window.dispatchEvent(new Event('wishlistUpdated'))

            setTimeout(() => setWishlistMessage(''), 2500)
        } catch (err) {
            setWishlistMessage(err.response?.data?.message || 'Failed to update wishlist')
            setTimeout(() => setWishlistMessage(''), 3000)
        } finally {
            setWishlistSaving(false)
        }
    }

    const handleAddToCartClick = async () => {
        if (addingToCart || Number(product?.stock) <= 0) return

        setAddingToCart(true)
        setCartError('')
        setAddedNotification(false)

        const result = await addToCart(id)
        if (result.success) {
            setAddedNotification(true)
            setTimeout(() => setAddedNotification(false), 2500)
        } else {
            setCartError(result.message || 'Failed to add product to cart')
            setTimeout(() => setCartError(''), 3000)
        }
        setAddingToCart(false)
    }

    const handleRemoveFromCart = async () => {
        if (updatingQty) return

        setUpdatingQty(true)
        setCartError('')
        setAddedNotification(false)

        const result = await removeFromCart(id)
        if (!result.success) {
            setCartError(result.message || 'Failed to remove from cart')
            setTimeout(() => setCartError(''), 3000)
        }
        setUpdatingQty(false)
    }

    const handleQuantityChange = async (newQty) => {
        const maxStock = Number(product?.stock) || 0
        if (updatingQty) return

        if (newQty < 1) {
            await handleRemoveFromCart()
            return
        }

        if (newQty > maxStock) return

        setUpdatingQty(true)
        setCartError('')

        const result = await updateQuantity(id, newQty)
        if (!result.success) {
            setCartError(result.message || 'Failed to update quantity')
            setTimeout(() => setCartError(''), 3000)
        }
        setUpdatingQty(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back to Products
                    </button>
                </div>

               
                {loading && (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-semibold text-slate-500">
                            Loading product details...
                        </p>
                    </div>
                )}

                
                {!loading && (error || !product) && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Product Not Found
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            The product you are looking for does not exist or has been removed.
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all"
                        >
                            Return to Catalog
                        </Link>
                    </div>
                )}

                
                {!loading && product && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
                        {/* Left column: Product Image */}
                        <div className="w-full h-80 sm:h-96 lg:h-105 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        
                        <div className="flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                
                                <div>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider rounded-full">
                                        {product.category}
                                    </span>
                                </div>

                                
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {product.name}
                                </h1>

                                
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{Number(product.price).toFixed(2)}
                                    </span>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            Number(product.stock) > 0
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}
                                    >
                                        {Number(product.stock) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                    </span>
                                </div>

                                
                                <div className="pt-4 border-t border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Description
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            
                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                {addedNotification && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold text-center animate-fade-in">
                                        ✓ Item added to cart!
                                    </div>
                                )}
                                {cartError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center animate-fade-in">
                                        ⚠️ {cartError}
                                    </div>
                                )}

                                {inCartQty > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border border-slate-200 rounded-2xl bg-slate-50 p-3 shadow-xs">
                                            <div className="pl-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                                    In Your Cart
                                                </span>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    Quantity: {inCartQty}
                                                </span>
                                            </div>

                                             <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    disabled={updatingQty}
                                                    onClick={() => handleQuantityChange(inCartQty - 1)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-100 shadow-xs active:scale-95 cursor-pointer border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={inCartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                                                >
                                                    -
                                                </button>

                                                <span className="w-8 text-center font-black text-lg text-slate-900">
                                                    {updatingQty ? '...' : inCartQty}
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={inCartQty >= Number(product.stock) || updatingQty}
                                                    onClick={() => handleQuantityChange(inCartQty + 1)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                                                        inCartQty >= Number(product.stock) || updatingQty
                                                            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs active:scale-95 cursor-pointer'
                                                    }`}
                                                    title={inCartQty >= Number(product.stock) ? 'Maximum available stock reached' : 'Increase quantity'}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <Link
                                            to="/cart"
                                            className="block w-full py-3 text-center text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                                        >
                                            View in Cart ({inCartQty}) →
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddToCartClick}
                                        disabled={Number(product.stock) <= 0 || addingToCart}
                                        className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                                            Number(product.stock) <= 0
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                : addingToCart
                                                  ? 'bg-indigo-400 text-white cursor-wait'
                                                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                        </svg>
                                        <span>
                                            {addingToCart
                                                ? 'Adding...'
                                                : Number(product.stock) <= 0
                                                  ? 'Out of Stock'
                                                  : 'Add to Cart'}
                                        </span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistSaving}
                                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                                        wishlistSaving
                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                            : wishlisted
                                              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50'
                                    }`}
                                >
                                    {wishlistSaving ? (
                                        <span>⏳ Updating...</span>
                                    ) : wishlisted ? (
                                        <span>♥ Remove from Wishlist</span>
                                    ) : (
                                        <span>♡ Add to Wishlist</span>
                                    )}
                                </button>

                                {wishlistMessage && (
                                    <p className="text-center text-xs font-semibold text-rose-600">
                                        {wishlistMessage}
                                    </p>
                                )}

                                <p className="text-center text-[11px] text-slate-400">
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ProductDetails
