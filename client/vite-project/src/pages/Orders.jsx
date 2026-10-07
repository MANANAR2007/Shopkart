import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let isMounted = true

        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders')
                if (isMounted) {
                    if (response.data && Array.isArray(response.data.orders)) {
                        setOrders(response.data.orders)
                    } else {
                        setOrders([])
                    }
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to load your orders.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchOrders()

        return () => {
            isMounted = false
        }
    }, [reloadKey])

    const handleRetry = () => {
        setLoading(true)
        setReloadKey((prev) => prev + 1)
    }

    const getStatusStepIndex = (status) => {
        const index = STATUS_STEPS.indexOf(status)
        return index !== -1 ? index : 0
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Track and view past purchases with snapshot receipts.
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors"
                    >
                        <span>Continue Shopping</span>
                        <span>→</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-500">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-700">
                        <span className="text-4xl block mb-2">⚠️</span>
                        <h2 className="text-lg font-bold mb-1">Unable to Load Orders</h2>
                        <p className="text-sm mb-4 text-rose-600">{error}</p>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                        <span className="text-6xl block mb-4">📦</span>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No Orders Yet</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            You have not placed any orders yet. Start exploring our catalog!
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const currentStepIdx = getStatusStepIndex(order.status)
                            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow"
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                        <div>
                                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                                                Order ID
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-800">
                                                #{order._id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                                                Placed On
                                            </span>
                                            <span className="text-xs font-medium text-slate-700">
                                                {orderDate}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                                                Total Amount
                                            </span>
                                            <span className="text-sm font-extrabold text-indigo-600">
                                                ₹{(order.totalAmount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span
                                                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                                                    order.status === 'CANCELLED'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : order.status === 'DELIVERED'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : order.status === 'SHIPPED'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                        : order.status === 'CONFIRMED'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Order Progression Stepper / Timeline */}
                                    {order.status === 'CANCELLED' ? (
                                        <div className="py-4 border-b border-slate-100">
                                            <div className="flex items-center justify-between max-w-sm mx-auto px-4 relative">
                                                <div className="flex flex-col items-center z-10">
                                                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                        ✓
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-1 text-slate-700 uppercase tracking-wider">
                                                        PLACED
                                                    </span>
                                                </div>

                                                <div className="flex-1 h-0.5 bg-rose-300 mx-3 -mt-3.5"></div>

                                                <div className="flex flex-col items-center z-10">
                                                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-rose-100">
                                                        ✕
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-1 text-rose-600 uppercase tracking-wider">
                                                        CANCELLED
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 border-b border-slate-100">
                                            <div className="flex items-center justify-between relative max-w-xl mx-auto px-2">
                                                {STATUS_STEPS.map((step, idx) => {
                                                    const isCompleted = idx <= currentStepIdx
                                                    const isCurrent = idx === currentStepIdx

                                                    return (
                                                        <div key={step} className="flex flex-col items-center flex-1 relative">
                                                            <div
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                                                                    isCurrent
                                                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                                                        : isCompleted
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'bg-slate-200 text-slate-500'
                                                                }`}
                                                            >
                                                                {isCompleted ? '✓' : idx + 1}
                                                            </div>
                                                            <span
                                                                className={`text-[10px] font-bold mt-1 uppercase tracking-wider text-center ${
                                                                    isCurrent
                                                                        ? 'text-indigo-600'
                                                                        : isCompleted
                                                                        ? 'text-slate-700'
                                                                        : 'text-slate-400'
                                                                }`}
                                                            >
                                                                {step}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items Snapshot Preview */}
                                    <div className="py-4 space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-xs">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-slate-800 truncate block">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-slate-500 text-[11px]">
                                                        ₹{(item.price || 0).toFixed(2)} × {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="font-extrabold text-slate-900 shrink-0">
                                                    ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            Payment: <strong className="text-slate-600 uppercase">{order.paymentStatus}</strong>
                                        </span>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                        >
                                            <span>View Details</span>
                                            <span>→</span>
                                        </Link>
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

export default Orders
