import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function OrderSuccess() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`)
                if (isMounted && res.data && res.data.order) {
                    setOrder(res.data.order)
                }
            } catch {
                // If fetch fails or still indexing, ID is still available from params
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        if (id) fetchOrder()
        return () => {
            isMounted = false
        }
    }, [id])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex items-center justify-center">
                <div className="w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                        ✓
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Thank you for your purchase. Your payment was verified and your order has been confirmed.
                    </p>

                    {/* Order Meta Box */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 mb-8 text-left space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200/60 pb-2">
                            <span>Order ID:</span>
                            <span className="font-mono font-bold text-slate-800">{id}</span>
                        </div>

                        {loading ? (
                            <div className="py-2 text-center text-xs text-slate-400">Loading order summary...</div>
                        ) : order ? (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Status:</span>
                                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase text-[11px]">
                                        {order.status || 'PLACED'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Payment Status:</span>
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase text-[11px]">
                                        {order.paymentStatus || 'PAID'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Items:</span>
                                    <span className="font-semibold text-slate-800">
                                        {order.items?.length || 0} product(s)
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                                    <span className="text-sm font-bold text-slate-900">Total Paid:</span>
                                    <span className="text-lg font-black text-indigo-600">
                                        ₹{(order.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Status:</span>
                                <span className="font-bold text-emerald-600">PLACED</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/orders"
                            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md text-center"
                        >
                            View My Orders
                        </Link>
                        <Link
                            to="/products"
                            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all text-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default OrderSuccess
