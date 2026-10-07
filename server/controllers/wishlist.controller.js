import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

export const addToWishlist = async (req, res) => {
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

        const user = await Customer.findById(req.user._id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        if (!user.wishlist) {
            user.wishlist = []
        }

        const isAlreadyWishlisted = user.wishlist.some(
            (id) => id.toString() === productId
        )

        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            })
        }

        user.wishlist.push(productId)
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock'
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const wishlist = (user.wishlist || []).filter((item) => item !== null)

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const user = await Customer.findById(req.user._id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        if (!user.wishlist) {
            user.wishlist = []
        }

        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        )

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            })
        }

        user.wishlist.splice(index, 1)
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const toggleWishlist = async (req, res) => {
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

        const user = await Customer.findById(req.user._id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        if (!user.wishlist) {
            user.wishlist = []
        }

        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        )

        if (index > -1) {
            user.wishlist.splice(index, 1)
            await user.save()

            return res.status(200).json({
                success: true,
                message: 'Product removed from wishlist',
                wishlisted: false,
                count: user.wishlist.length
            })
        } else {
            user.wishlist.push(productId)
            await user.save()

            return res.status(200).json({
                success: true,
                message: 'Product added to wishlist',
                wishlisted: true,
                count: user.wishlist.length
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
