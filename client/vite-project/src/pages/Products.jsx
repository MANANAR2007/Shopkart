import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

function Products() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialCategory = searchParams.get('category') || ''
    const initialSort = searchParams.get('sort') || ''

    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState(initialCategory)
    const [sort, setSort] = useState(initialSort)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [wishlistIds, setWishlistIds] = useState(new Set())

    const categories = ['Electronics', 'Fashion', 'Books', 'Home']

    useEffect(() => {
        let isMounted = true

        const fetchUserWishlist = async () => {
            try {
                const response = await api.get('/wishlist')
                if (isMounted && response.data?.wishlist) {
                    const ids = new Set(response.data.wishlist.map((item) => item._id))
                    setWishlistIds(ids)
                }
            } catch {
                // Ignore wishlist check error
            }
        }

        fetchUserWishlist()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const fetchProducts = async () => {
            try {
                setLoading(true)
                setError('')

                const params = {}
                if (search.trim()) {
                    params.search = search.trim()
                }
                if (category && category !== 'All') {
                    params.category = category
                }
                if (sort) {
                    params.sort = sort
                }

                const response = await api.get('/products', { params })
                const data = response.data

                if (isMounted) {
                    if (data && Array.isArray(data.products)) {
                        setProducts(data.products)
                    } else if (Array.isArray(data)) {
                        setProducts(data)
                    } else {
                        setProducts([])
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || err.message || 'Failed to fetch products')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchProducts()

        return () => {
            isMounted = false
        }
    }, [search, category, sort])

    const handleCategoryChange = (e) => {
        const selected = e.target.value
        setCategory(selected)
        if (selected) {
            searchParams.set('category', selected)
        } else {
            searchParams.delete('category')
        }
        setSearchParams(searchParams)
    }

    const handleSortChange = (e) => {
        const selected = e.target.value
        setSort(selected)
        if (selected) {
            searchParams.set('sort', selected)
        } else {
            searchParams.delete('sort')
        }
        setSearchParams(searchParams)
    }

    const handleResetFilters = () => {
        setSearch('')
        setCategory('')
        setSort('')
        searchParams.delete('category')
        searchParams.delete('sort')
        setSearchParams(searchParams)
    }

    const handleWishlistChange = (productId) => {
        setWishlistIds((prev) => new Set(prev).add(productId))
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Shop Products
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        Discover products across different categories.
                    </p>
                </div>

                {/* Search, Category Filter & Sorting Controls */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Category Dropdown Filter */}
                        <div className="sm:w-48">
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sorting Dropdown Filter (Bonus: price_asc / price_desc) */}
                        <div className="sm:w-52">
                            <select
                                value={sort}
                                onChange={handleSortChange}
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="">Sort by: Default</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-semibold text-slate-500">
                            Loading products...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                        <span className="text-4xl block mb-3">🔍</span>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            No products found.
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Try adjusting your search query or selecting a different category.
                        </p>
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-lg cursor-pointer"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* Product Grid using ProductCard component */}
                {!loading && !error && products.length > 0 && (
                    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={wishlistIds.has(product._id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Products
