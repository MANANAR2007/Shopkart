import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import { loadRazorpayScript } from '../utils/loadRazorpay'

function Checkout() {
    const navigate = useNavigate()
    const { cartItems, totalItems, subtotal, clearCart, loading: cartLoading } = useCart()

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    })

    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState('')
    const [createdOrderData, setCreatedOrderData] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
        if (serverError) setServerError('')
    }

    const validateForm = () => {
        const newErrors = {}

        if (!form.fullName.trim()) {
            newErrors.fullName = 'Full Name is required'
        }
        if (!form.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            newErrors.phone = 'Phone number must contain exactly 10 digits'
        }

        if (!form.addressLine1.trim()) {
            newErrors.addressLine1 = 'Street address is required'
        }
        if (!form.city.trim()) {
            newErrors.city = 'City is required'
        }
        if (!form.state.trim()) {
            newErrors.state = 'State is required'
        }
        if (!form.pincode.trim()) {
            newErrors.pincode = 'Pincode is required'
        } else if (!/^\d{6}$/.test(form.pincode.trim())) {
            newErrors.pincode = 'Pincode must contain exactly 6 digits'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePaymentSuccess = async (paymentDetails) => {
        try {
            setSubmitting(true)
            const verifyRes = await api.post('/orders/verify-payment', paymentDetails)
            if (verifyRes.data && verifyRes.data.success) {
                clearCart()
                navigate(`/order-success/${verifyRes.data.order._id}`)
            } else {
                setServerError(verifyRes.data?.message || 'Payment verification failed.')
            }
        } catch (err) {
            setServerError(
                err.response?.data?.message ||
                'Payment verification failed. Your cart has not been cleared.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleSimulatedTestPayment = async () => {
        if (!createdOrderData) return
        try {
            setSubmitting(true)
            setServerError('')
            const simulatedPayId = `pay_test_${Date.now()}`
            const signRes = await api.post('/orders/dev-test-signature', {
                shopKartOrderId: createdOrderData.shopKartOrderId,
                razorpay_payment_id: simulatedPayId
            })

            if (signRes.data && signRes.data.success) {
                await handlePaymentSuccess({
                    shopKartOrderId: createdOrderData.shopKartOrderId,
                    razorpay_order_id: signRes.data.razorpay_order_id,
                    razorpay_payment_id: simulatedPayId,
                    razorpay_signature: signRes.data.razorpay_signature
                })
            }
        } catch (err) {
            setServerError(err.response?.data?.message || 'Simulated test payment failed.')
            setSubmitting(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        if (!cartItems || cartItems.length === 0) {
            setServerError('Your cart is empty. Add products before checking out.')
            return
        }

        setSubmitting(true)
        setServerError('')

        try {
            // Step 1: Create ShopKart Order and Razorpay Order on server
            const orderRes = await api.post('/orders/create-payment-order', {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    addressLine1: form.addressLine1.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim()
                }
            })

            const orderData = orderRes.data
            setCreatedOrderData(orderData)

            // Step 2: Dynamically load Razorpay SDK
            const isLoaded = await loadRazorpayScript()
            if (!isLoaded || !window.Razorpay) {
                setServerError('Razorpay SDK failed to load. You can complete the order using Test Mode simulation below.')
                setSubmitting(false)
                return
            }

            // Step 3: Open Razorpay Test Checkout modal
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'ShopKart',
                description: 'Order Payment (Test Mode)',
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    await handlePaymentSuccess({
                        shopKartOrderId: orderData.shopKartOrderId,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                },
                prefill: {
                    name: form.fullName,
                    contact: form.phone
                },
                theme: {
                    color: '#4f46e5'
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false)
                    }
                }
            }

            try {
                const rzp = new window.Razorpay(options)
                rzp.on('payment.failed', function (res) {
                    setServerError(
                        res.error?.description ||
                        'Payment failed. Your cart has been preserved. Please try again.'
                    )
                    setSubmitting(false)
                })
                rzp.open()
            } catch (rzpInitErr) {
                console.warn('Razorpay modal init error:', rzpInitErr)
                setServerError(
                    'Razorpay test popup could not initialize (mock test key detected). You can use "Simulate Test Payment" below.'
                )
                setSubmitting(false)
            }
        } catch (err) {
            setServerError(
                err.response?.data?.message || 'Server error creating order. Please check stock and try again.'
            )
            setSubmitting(false)
        }
    }

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        )
    }

    if (!cartLoading && (!cartItems || cartItems.length === 0) && !createdOrderData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="max-w-2xl mx-auto my-auto p-8 text-center bg-white rounded-2xl shadow-xs border border-slate-200">
                    <span className="text-5xl block mb-4">🛒</span>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-slate-600 mb-6">
                        You need items in your cart to proceed with checkout.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-xs"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Please review your items and enter shipping details to complete your order.
                    </p>
                </div>

                {serverError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1 text-sm font-medium">
                            <p>{serverError}</p>
                            {createdOrderData && (
                                <button
                                    type="button"
                                    onClick={handleSimulatedTestPayment}
                                    disabled={submitting}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                                >
                                    ⚡ Complete Dev Test Payment
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Shipping Address Form */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span>📍</span> Shipping Address
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Aarav Sharma"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                        errors.fullName
                                            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                            : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Phone Number (10 digits) *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 9876543210"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                        errors.phone
                                            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                            : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Address Line 1 *
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={form.addressLine1}
                                    onChange={handleChange}
                                    placeholder="House/Flat No., Apartment, Street"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                        errors.addressLine1
                                            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                            : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                    }`}
                                />
                                {errors.addressLine1 && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.addressLine1}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                            errors.city
                                                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                        }`}
                                    />
                                    {errors.city && (
                                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                            errors.state
                                                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                        }`}
                                    />
                                    {errors.state && (
                                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.state}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Pincode (6 digits) *
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    maxLength={6}
                                    value={form.pincode}
                                    onChange={handleChange}
                                    placeholder="e.g. 560001"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                                        errors.pincode
                                            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                                            : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                                    }`}
                                />
                                {errors.pincode && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.pincode}</p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Processing Order...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Place Order & Pay ₹{subtotal.toFixed(2)}</span>
                                            <span>→</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </span>
                        </div>

                        {/* Items list */}
                        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mb-4 pr-1">
                            {cartItems.map((item) => (
                                <div key={item.product?._id || item._id} className="py-3 flex items-center gap-3">
                                    <img
                                        src={item.product?.image || 'https://placehold.co/80x80'}
                                        alt={item.product?.name}
                                        className="w-12 h-12 object-cover rounded-lg border border-slate-100 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-slate-800 truncate">
                                            {item.product?.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            ₹{(Number(item.product?.price) || 0).toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900 shrink-0">
                                        ₹{((Number(item.product?.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Items Subtotal:</span>
                                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee:</span>
                                <span className="font-bold text-emerald-600 uppercase">FREE</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Estimated Taxes:</span>
                                <span className="text-slate-400">Included</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-baseline">
                            <span className="text-sm font-bold text-slate-900">Total Payable</span>
                            <span className="text-2xl font-black text-indigo-600">
                                ₹{subtotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
                            <span>🔒</span>
                            <span>Test Mode Razorpay Checkout. No actual bank charge will occur.</span>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                to="/cart"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                ← Edit Cart Items
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Checkout
