import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

const ALLOWED_STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function OrderDetails() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let isMounted = true

        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`/orders/${id}`)
                if (isMounted) {
                    if (response.data && response.data.order) {
                        setOrder(response.data.order)
                    } else {
                        setError('Order not found.')
                    }
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to load order details.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        if (id) {
            fetchOrderDetails()
        }

        return () => {
            isMounted = false
        }
    }, [id, reloadKey])

    const handleRetry = () => {
        setLoading(true)
        setReloadKey((prev) => prev + 1)
    }

    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdatingStatus(true)
            setStatusMessage('')
            const response = await api.patch(`/orders/${id}/status`, { status: newStatus })
            if (response.data && response.data.order) {
                setOrder(response.data.order)
                setStatusMessage(`Status successfully updated to ${newStatus}`)
            }
        } catch (err) {
            setStatusMessage(err.response?.data?.message || 'Failed to update order status.')
        } finally {
            setUpdatingStatus(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <span>←</span>
                        <span>Back to My Orders</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-500">Loading order details...</p>
                    </div>
                ) : error || !order ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-700">
                        <span className="text-4xl block mb-2">⚠️</span>
                        <h2 className="text-lg font-bold mb-1">Order Not Found</h2>
                        <p className="text-sm mb-4 text-rose-600">{error || 'Could not find the requested order.'}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                                Try Again
                            </button>
                            <Link
                                to="/orders"
                                className="inline-block px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                Back to Orders
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header Banner */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                            Order #{order._id}
                                        </h1>
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
                                    <p className="text-xs text-slate-500 mt-1">
                                        Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                                        Total Paid
                                    </span>
                                    <span className="text-2xl font-black text-indigo-600">
                                        ₹{(order.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Visual Order Timeline */}
                            <div className="pt-6 pb-2 border-b border-slate-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center sm:text-left">
                                    Order Timeline
                                </span>
                                {order.status === 'CANCELLED' ? (
                                    <div className="flex items-center justify-between max-w-sm mx-auto px-4 relative py-2">
                                        <div className="flex flex-col items-center z-10">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                ✓
                                            </div>
                                            <span className="text-[11px] font-bold mt-1 text-slate-700 uppercase tracking-wider">
                                                PLACED
                                            </span>
                                        </div>

                                        <div className="flex-1 h-0.5 bg-rose-300 mx-3 -mt-3.5"></div>

                                        <div className="flex flex-col items-center z-10">
                                            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-rose-100">
                                                ✕
                                            </div>
                                            <span className="text-[11px] font-bold mt-1 text-rose-600 uppercase tracking-wider">
                                                CANCELLED
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between relative max-w-xl mx-auto px-2 py-2">
                                        {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                                            const currentIdx = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].indexOf(order.status)
                                            const isCompleted = currentIdx !== -1 && idx <= currentIdx
                                            const isCurrent = order.status === step

                                            return (
                                                <div key={step} className="flex flex-col items-center flex-1 relative">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
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
                                                        className={`text-[11px] font-bold mt-1 uppercase tracking-wider text-center ${
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
                                )}
                            </div>

                            {/* Meta Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                                        Payment Status
                                    </span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase">
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.razorpayPaymentId && (
                                    <div>
                                        <span className="text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                                            Payment ID
                                        </span>
                                        <span className="font-mono text-slate-700 truncate block">
                                            {order.razorpayPaymentId}
                                        </span>
                                    </div>
                                )}
                                {order.razorpayOrderId && (
                                    <div>
                                        <span className="text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                                            Razorpay Order ID
                                        </span>
                                        <span className="font-mono text-slate-700 truncate block">
                                            {order.razorpayOrderId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bonus: Order Status Progression Interactive Controller */}
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                                        <span>⭐</span> Order Status Progression
                                    </h3>
                                    <p className="text-[11px] text-indigo-700 mt-0.5">
                                        Simulate order status progression between allowed statuses.
                                    </p>
                                </div>
                                {statusMessage && (
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                                        {statusMessage}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {ALLOWED_STATUSES.map((status) => {
                                    const isCurrent = order.status === status
                                    const isCancelledBtn = status === 'CANCELLED'

                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => handleUpdateStatus(status)}
                                            disabled={updatingStatus || isCurrent}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                isCurrent
                                                    ? isCancelledBtn
                                                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                                                        : 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                                                    : isCancelledBtn
                                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                                    : 'bg-white hover:bg-indigo-100 text-slate-700 border border-slate-200'
                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            {status} {isCurrent && '✓'}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order Items Snapshot Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span>🛒</span> Ordered Products Snapshot
                            </h2>

                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="py-4 flex items-center gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">
                                                {item.name}
                                            </h3>
                                            <span className="text-xs text-slate-500">
                                                Snapshot Price: ₹{(item.price || 0).toFixed(2)} each
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs text-slate-500 block">
                                                Qty: {item.quantity}
                                            </span>
                                            <span className="text-sm font-extrabold text-slate-900">
                                                ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Summary */}
                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-slate-900">₹{(order.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping:</span>
                                    <span className="font-bold text-emerald-600 uppercase">FREE</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                                    <span>Grand Total:</span>
                                    <span className="text-indigo-600 font-black">₹{(order.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span>📍</span> Delivery Shipping Address
                            </h2>
                            {order.shippingAddress ? (
                                <div className="text-xs text-slate-600 space-y-1">
                                    <p className="font-bold text-slate-900 text-sm">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                    <p className="pt-2 text-slate-500">
                                        Contact: <strong className="text-slate-800">{order.shippingAddress.phone}</strong>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">No address recorded.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default OrderDetails
