import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        if (!customer.cart) {
            customer.cart = []
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        )

        if (cartItem) {
            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Only ${product.stock} items in stock.`
                })
            }
            cartItem.quantity += 1
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            })
        }

        await customer.save()
        await customer.populate({
            path: 'cart.product',
            select: 'name price image stock category description'
        })

        const cart = customer.cart.filter((item) => item.product !== null)

        return res.status(200).json({
            success: true,
            message: 'Product added to cart',
            cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
            select: 'name price image stock category description'
        })

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const cart = (customer.cart || []).filter((item) => item.product !== null)

        return res.status(200).json({
            success: true,
            count: cart.length,
            cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const parsedQty = Number(quantity)
        if (
            quantity === undefined ||
            quantity === null ||
            isNaN(parsedQty) ||
            !Number.isInteger(parsedQty) ||
            parsedQty < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a valid integer greater than or equal to 1'
            })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        if (parsedQty > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity exceeds available stock (${product.stock})`
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        if (!customer.cart) {
            customer.cart = []
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        )

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            })
        }

        cartItem.quantity = parsedQty
        await customer.save()

        await customer.populate({
            path: 'cart.product',
            select: 'name price image stock category description'
        })

        const cart = customer.cart.filter((item) => item.product !== null)

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        customer.cart = (customer.cart || []).filter(
            (item) => item.product.toString() !== productId
        )

        await customer.save()
        await customer.populate({
            path: 'cart.product',
            select: 'name price image stock category description'
        })

        const cart = customer.cart.filter((item) => item.product !== null)

        return res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
