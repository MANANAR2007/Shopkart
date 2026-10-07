import 'dotenv/config'
import Razorpay from 'razorpay'

// Diagnostic logging (safe: never prints the secret itself)
console.log('[Razorpay Config] Key ID Loaded:', process.env.RAZORPAY_KEY_ID || 'MISSING')
console.log('[Razorpay Config] Secret Loaded:', Boolean(process.env.RAZORPAY_KEY_SECRET))
console.log('[Razorpay Config] Secret Length:', process.env.RAZORPAY_KEY_SECRET?.length || 0)

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
})

export default razorpay
