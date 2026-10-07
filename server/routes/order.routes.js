import express from 'express'
import {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getDevTestSignature
} from '../controllers/order.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/create-payment-order', authMiddleware, createPaymentOrder)
router.post('/verify-payment', authMiddleware, verifyPayment)
router.get('/', authMiddleware, getOrders)
router.get('/:id', authMiddleware, getOrderById)
router.patch('/:id/status', authMiddleware, updateOrderStatus)
router.post('/dev-test-signature', authMiddleware, getDevTestSignature)

export default router
