import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [wishlistCount, setWishlistCount] = useState(0)
    const { totalItems } = useCart()

    useEffect(() => {
        let isMounted = true

        const loadWishlistCount = async () => {
            try {
                const response = await api.get('/wishlist')
                if (isMounted && response.data && typeof response.data.count === 'number') {
                    setWishlistCount(response.data.count)
                }
            } catch {
                // Ignore wishlist fetch error when unauthenticated
            }
        }

        loadWishlistCount()

        const handleWishlistChange = () => {
            loadWishlistCount()
        }

        window.addEventListener('wishlistUpdated', handleWishlistChange)
        return () => {
            isMounted = false
            window.removeEventListener('wishlistUpdated', handleWishlistChange)
        }
    }, [location.pathname])

    const handleLogout = async () => {
        try {
            await api.post('/customers/logout')
            navigate('/login')
        } catch {
            navigate('/login')
        }
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/home" className="flex items-center gap-2 group">
                    <span className="text-2xl">🛒</span>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                        ShopKart
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-1 sm:gap-4">
                    <Link
                        to="/home"
                        className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                            isActive('/home')
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        Home
                    </Link>

                    <Link
                        to="/products"
                        className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                            isActive('/products') || location.pathname.startsWith('/products/')
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        Products
                    </Link>

                    <Link
                        to="/wishlist"
                        className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                            isActive('/wishlist')
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <span>Wishlist</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                            {wishlistCount}
                        </span>
                    </Link>

                    <Link
                        to="/cart"
                        className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                            isActive('/cart')
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <span>Cart</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                            {totalItems}
                        </span>
                    </Link>

                    <Link
                        to="/orders"
                        className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                            isActive('/orders') || location.pathname.startsWith('/orders/')
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        Orders
                    </Link>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar