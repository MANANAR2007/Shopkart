import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
const PORT = 8002

mongoose.connect(process.env.dbUrl).then(() => {
    console.log('Db Connected')
}).catch((err) => {
    console.log(err)
})

app.use(cors({
    origin: 'http://localhost:5175',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))

app.use(express.json())
app.use(cookieParser())

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.get('/', (req, res) => {
    res.send('ShopKart Server Running')
})

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})