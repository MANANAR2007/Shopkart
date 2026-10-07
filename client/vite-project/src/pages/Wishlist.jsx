import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Wishlist() {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [removingId, setRemovingId] = useState(null)

    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let isMounted = true

        const fetchWishlist = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await api.get('/wishlist')
                const data = response.data
                if (isMounted) {
                    setWishlist(Array.isArray(data.wishlist) ? data.wishlist : [])
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'We couldn\'t load your wishlist.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchWishlist()

        return () => {
            isMounted = false
        }
    }, [reloadKey])

    const handleTryAgain = () => {
        setReloadKey((k) => k + 1)
    }

    const handleRemove = async (productId) => {
        if (removingId) return

        setRemovingId(productId)
        try {
            await api.delete(`/wishlist/${productId}`)
            setWishlist((prev) => prev.filter((item) => item._id !== productId))
            window.dispatchEvent(new Event('wishlistUpdated'))
        } catch (err) {
            console.error('Failed to remove product from wishlist:', err)
            alert(err.response?.data?.message || 'Failed to remove product from wishlist')
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        My Wishlist
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        Products you've saved to buy later.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-semibold text-slate-500">
                            Loading your wishlist...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center max-w-md mx-auto my-12 shadow-xs">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                            Something went wrong.
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            We couldn't load your wishlist.
                        </p>
                        <button
                            type="button"
                            onClick={handleTryAgain}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                        <span className="text-5xl block mb-4">❤️</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Save products you love and find them here later.
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {/* Wishlist Grid */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => {
                            const inStock = Number(product.stock) > 0
                            const isRemoving = removingId === product._id

                            return (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-700 rounded-md shadow-xs">
                                            {product.category}
                                        </span>
                                    </div>

                                    {/* Product Information */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h2 className="font-bold text-slate-900 text-base line-clamp-1">
                                                {product.name}
                                            </h2>
                                            <p className="text-xs font-semibold text-slate-400 mt-1">
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

                                        {/* Actions: View Details and Remove from Wishlist */}
                                        <div className="mt-5 space-y-2">
                                            <Link
                                                to={`/products/${product._id}`}
                                                className="block w-full py-2.5 text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                                            >
                                                View Details
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => handleRemove(product._id)}
                                                disabled={isRemoving}
                                                className="w-full py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isRemoving ? (
                                                    <span>Removing...</span>
                                                ) : (
                                                    <span>Remove from Wishlist</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Wishlist
