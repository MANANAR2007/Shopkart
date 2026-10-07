import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/product.model.js'

dotenv.config()

const sampleProducts = [
    {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cushions.',
        price: 199.99,
        category: 'Electronics',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Smart Fitness Watch Series 5',
        description: 'Advanced health and fitness tracker with AMOLED display, heart rate monitor, sleep tracking, and 7-day battery life.',
        price: 149.50,
        category: 'Electronics',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with tactile switches, aircraft-grade aluminum frame, and detachable wrist rest.',
        price: 89.99,
        category: 'Electronics',
        stock: 0, // Out of stock for testing
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Classic Denim Trucker Jacket',
        description: 'Timeless vintage wash denim jacket tailored with durable 100% organic cotton, button chest pockets, and relaxed fit.',
        price: 79.00,
        category: 'Fashion',
        stock: 22,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Minimalist Leather Sneakers',
        description: 'Handcrafted white low-top sneakers with genuine leather upper, cushioned insole, and vulcanized rubber sole.',
        price: 110.00,
        category: 'Fashion',
        stock: 5,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Clean Code: A Handbook of Agile Craftsmanship',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Master software craftsmanship.',
        price: 34.99,
        category: 'Books',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'The Pragmatic Programmer',
        description: '20th Anniversary Edition of the essential guide for modern software developers, covering career advice, best practices, and philosophy.',
        price: 42.50,
        category: 'Books',
        stock: 7,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Handcrafted Ceramic Coffee Mug Set',
        description: 'Set of 4 matte ceramic mugs with natural clay glaze finish, microwave and dishwasher safe, perfect for morning brews.',
        price: 38.00,
        category: 'Home',
        stock: 18,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
    },
    {
        name: 'Ergonomic LED Desk Lamp',
        description: 'Dimmable aluminum desk lamp with 5 color temperatures, wireless phone charging base, and flexible gooseneck arm.',
        price: 54.90,
        category: 'Home',
        stock: 0, // Out of stock for testing
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
    }
]

async function seed() {
    try {
        await mongoose.connect(process.env.dbUrl)
        console.log('Connected to DB for seeding')

        const count = await Product.countDocuments()
        if (count === 0) {
            await Product.insertMany(sampleProducts)
            console.log(`Seeded ${sampleProducts.length} sample products successfully!`)
        } else {
            console.log(`Products already exist (${count} items). Skipping seed.`)
        }
    } catch (err) {
        console.error('Seeding error:', err)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from DB')
    }
}

seed()
