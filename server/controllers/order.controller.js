import crypto from 'crypto'
import mongoose from 'mongoose'
import Order from '../models/order.model.js'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'
import razorpay from '../config/razorpay.js'

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            })
        }

        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress

        if (
            !fullName || !fullName.trim() ||
            !phone || !phone.trim() ||
            !addressLine1 || !addressLine1.trim() ||
            !city || !city.trim() ||
            !state || !state.trim() ||
            !pincode || !pincode.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'All shipping address fields are required'
            })
        }

        const cleanPhone = phone.trim()
        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must contain exactly 10 digits'
            })
        }

        const cleanPincode = pincode.trim()
        if (!/^\d{6}$/.test(cleanPincode)) {
            return res.status(400).json({
                success: false,
                message: 'Pincode must contain 6 digits'
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer || !customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            })
        }

        const productIds = customer.cart.map((item) => item.product)
        const products = await Product.find({ _id: { $in: productIds } })

        const itemsSnapshot = []
        let calculatedTotal = 0

        for (const cartItem of customer.cart) {
            const product = products.find(
                (p) => p._id.toString() === cartItem.product.toString()
            )

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'A product in your cart is no longer available'
                })
            }

            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${cartItem.quantity}`
                })
            }

            calculatedTotal += product.price * cartItem.quantity
            itemsSnapshot.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            })
        }

        const totalAmount = Math.round(calculatedTotal * 100) / 100

        const order = new Order({
            user: req.user._id,
            items: itemsSnapshot,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: cleanPhone,
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: cleanPincode
            },
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT'
        })

        const amountInPaise = Math.round(totalAmount * 100)
        let razorpayOrderId = ''

        try {
            const rzpOrder = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `rcpt_${order._id.toString().slice(-8)}`
            })
            razorpayOrderId = rzpOrder.id
        } catch (rzpError) {
            const rzpMsg = rzpError?.error?.description || rzpError?.message || 'Razorpay order creation failed'
            console.error('Razorpay SDK orders.create ERROR:', rzpMsg, rzpError?.statusCode || '')
            return res.status(500).json({
                success: false,
                message: `Payment gateway error: ${rzpMsg}`
            })
        }

        order.razorpayOrderId = razorpayOrderId
        await order.save()

        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: order.razorpayOrderId,
            amount: amountInPaise,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || ''
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error creating payment order'
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification parameters'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            })
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            })
        }

        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        const customer = await Customer.findById(req.user._id)
        if (customer) {
            customer.cart = []
            await customer.save()
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified and order placed successfully',
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error verifying payment'
        })
    }
}

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching orders'
        })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            })
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        return res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching order'
        })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            })
        }

        const allowedStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Allowed: ${allowedStatuses.join(', ')}`
            })
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        order.status = status
        await order.save()

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error updating order status'
        })
    }
}

export const getDevTestSignature = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id } = req.body

        if (!shopKartOrderId || !razorpay_payment_id) {
            return res.status(400).json({
                success: false,
                message: 'shopKartOrderId and razorpay_payment_id are required'
            })
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex')

        return res.status(200).json({
            success: true,
            razorpay_order_id: order.razorpayOrderId,
            razorpay_payment_id,
            razorpay_signature: signature
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error generating dev test signature'
        })
    }
}
