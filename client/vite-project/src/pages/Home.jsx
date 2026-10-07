import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Home() {
    const [customer, setCustomer] = useState(null)

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await api.get('/customers/me')
                setCustomer(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        getProfile()
    }, [])

    if (!customer) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-sm font-medium text-slate-500 animate-pulse">
                    Loading profile...
                </p>
            </div>
        )
    }

    const categories = [
        { name: 'Electronics', icon: '⚡', description: 'Gadgets, accessories & gear' },
        { name: 'Fashion', icon: '👕', description: 'Apparel, footwear & styles' },
        { name: 'Books', icon: '📚', description: 'Guides, literature & reads' },
        { name: 'Home', icon: '🏡', description: 'Living, décor & appliances' }
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
                
                <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-teal-500 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
                    <div className="max-w-2xl space-y-4 relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider rounded-full">
                            ShopKart Catalog
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                            Welcome to ShopKart
                        </h1>
                        <p className="text-indigo-100 text-base sm:text-lg">
                            Explore our latest products and find what you're looking for. High quality items at great prices.
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-indigo-50 active:scale-95 transition-all text-sm uppercase tracking-wider"
                            >
                                <span>Browse Products</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Categories Preview Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Browse by Category
                            </h2>
                            <p className="text-sm text-slate-500">
                                Select a category to quickly filter products
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            View all
                            <span>&rarr;</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/products?category=${cat.name}`}
                                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group block"
                            >
                                <div className="text-3xl mb-3">{cat.icon}</div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {cat.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                
                <div className="pt-6 border-t border-slate-200">
                    <div className="mb-6">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                            Account Overview
                        </p>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                            Customer Profile: {customer.fullName}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Customer Name
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {customer.fullName}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Email Address
                            </p>
                            <p className="text-lg font-bold text-slate-900 break-all">
                                {customer.email}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Phone Number
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {customer.phone}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Home