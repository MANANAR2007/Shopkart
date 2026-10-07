import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'

function Cart() {
    const navigate = useNavigate()
    const {
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        updateQuantity,
        removeFromCart,
        refreshCart
    } = useCart()

    const [updatingId, setUpdatingId] = useState(null)
    const [actionError, setActionError] = useState({})

    const handleQuantityChange = async (productId, newQuantity, maxStock) => {
        if (newQuantity < 1 || newQuantity > maxStock || updatingId === productId) {
            return
        }

        setUpdatingId(productId)
        setActionError((prev) => ({ ...prev, [productId]: '' }))

        const result = await updateQuantity(productId, newQuantity)
        if (!result.success) {
            setActionError((prev) => ({
                ...prev,
                [productId]: result.message || 'Failed to update quantity'
            }))
            setTimeout(() => {
                setActionError((prev) => ({ ...prev, [productId]: '' }))
            }, 3000)
        }

        setUpdatingId(null)
    }

    const handleRemove = async (productId) => {
        if (updatingId === productId) return

        setUpdatingId(productId)
        setActionError((prev) => ({ ...prev, [productId]: '' }))

        const result = await removeFromCart(productId)
        if (!result.success) {
            setActionError((prev) => ({
                ...prev,
                [productId]: result.message || 'Failed to remove item'
            }))
            setTimeout(() => {
                setActionError((prev) => ({ ...prev, [productId]: '' }))
            }, 3000)
        }

        setUpdatingId(null)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Shopping Cart
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base">
                            Review your items and proceed to checkout.
                        </p>
                    </div>

                    {cartItems.length > 0 && (
                        <div className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-2">
                            <span>Total Units:</span>
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {totalItems}
                            </span>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && cartItems.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-semibold text-slate-500">
                            Loading your cart...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && cartItems.length === 0 && (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center max-w-md mx-auto my-12 shadow-xs">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                            Unable to load your cart.
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={refreshCart}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty Cart State */}
                {!loading && !error && cartItems.length === 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center max-w-lg mx-auto my-8 shadow-xs">
                        <span className="text-6xl block mb-4">🛒</span>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            Your cart is empty 🛒
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base mb-8 max-w-sm mx-auto">
                            Looks like you haven't added anything yet. Discover our latest products and start shopping!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <span>Browse Products</span>
                        </Link>
                    </div>
                )}

                {/* Non-empty Cart View */}
                {cartItems.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {cartItems.map((item) => {
                                const product = item.product || {}
                                const isUpdating = updatingId === product._id
                                const itemTotal = (Number(product.price) || 0) * (Number(item.quantity) || 0)
                                const maxStock = Number(product.stock) || 0
                                const canDecrease = item.quantity > 1
                                const canIncrease = item.quantity < maxStock

                                return (
                                    <div
                                        key={item._id || product._id}
                                        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden"
                                    >
                                        {/* Product Thumbnail */}
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 block group"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold uppercase tracking-wider mb-1">
                                                        {product.category}
                                                    </span>
                                                    <Link
                                                        to={`/products/${product._id}`}
                                                        className="block font-bold text-base sm:text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
                                                <span className="font-bold text-slate-700">
                                                    Unit Price: ₹{Number(product.price).toFixed(2)}
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span className={`${maxStock <= 3 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                                                    Stock: {maxStock} available
                                                </span>
                                            </div>

                                            {/* Quantity and Actions Bar */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                                {/* Quantity Selector [-] qty [+] */}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                                                        Quantity:
                                                    </span>
                                                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                                                        <button
                                                            type="button"
                                                            disabled={!canDecrease || isUpdating}
                                                            onClick={() =>
                                                                handleQuantityChange(product._id, item.quantity - 1, maxStock)
                                                            }
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-700 transition-all ${
                                                                !canDecrease || isUpdating
                                                                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                                                                    : 'hover:bg-white hover:text-indigo-600 hover:shadow-xs active:scale-95 cursor-pointer'
                                                            }`}
                                                            title={item.quantity <= 1 ? 'Minimum quantity reached' : 'Decrease quantity'}
                                                        >
                                                            -
                                                        </button>

                                                        <span className="w-10 text-center font-extrabold text-sm text-slate-900">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={!canIncrease || isUpdating}
                                                            onClick={() =>
                                                                handleQuantityChange(product._id, item.quantity + 1, maxStock)
                                                            }
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-700 transition-all ${
                                                                !canIncrease || isUpdating
                                                                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                                                                    : 'hover:bg-white hover:text-indigo-600 hover:shadow-xs active:scale-95 cursor-pointer'
                                                            }`}
                                                            title={item.quantity >= maxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {isUpdating && (
                                                        <span className="text-xs text-indigo-600 font-semibold animate-pulse">
                                                            Updating...
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() => handleRemove(product._id)}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                    <span>Remove</span>
                                                </button>
                                            </div>

                                            {/* Action Error if any */}
                                            {actionError[product._id] && (
                                                <p className="mt-2 text-xs font-semibold text-rose-600">
                                                    ⚠️ {actionError[product._id]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Item Total (right aligned) */}
                                        <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                                            <span className="text-xs text-slate-400 sm:block">Item Total</span>
                                            <p className="text-lg font-black text-slate-900">
                                                ₹{itemTotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs sticky top-24 space-y-6">
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Total Items:</span>
                                        <span className="font-bold text-slate-900">{totalItems} units</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Cart Rows:</span>
                                        <span className="font-bold text-slate-900">{cartItems.length} products</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Shipping:</span>
                                        <span className="font-bold text-emerald-600">FREE</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                                    <div>
                                        <span className="text-base font-bold text-slate-900">Subtotal</span>
                                        <span className="block text-[11px] text-slate-400">Includes all taxes</span>
                                    </div>
                                    <span className="text-2xl font-black text-indigo-600">
                                        ₹{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>Proceed to Checkout</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>

                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/products')}
                                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                        ← Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Cart
