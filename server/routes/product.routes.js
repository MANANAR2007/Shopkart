import express from 'express'
import {
    createProduct,
    getAllProducts,
    getSingleProduct
} from '../controllers/product.controller.js'

const productRoutes = express.Router()

productRoutes.post('/', createProduct)
productRoutes.post('/products', createProduct)

productRoutes.get('/', getAllProducts)
productRoutes.get('/products', getAllProducts)

productRoutes.get('/:id', getSingleProduct)
productRoutes.get('/products/:id', getSingleProduct)

export default productRoutes
