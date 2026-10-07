import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
    })

    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
            setError('All fields are required')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        try {
            const response = await api.post('/customers/register', formData)
            console.log(response.data)

            navigate('/login')
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message)
            } else {
                setError('Unable to connect to server')
            }
        }
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 sm:p-10">

                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        Create Account
                    </h1>
                    <p className="text-gray-500">Sign up to get started</p>
                </div>

                
                {error && (
                    <div className="mb-5 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    
                    <div className="flex flex-col">
                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </span>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full h-12 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    
                    <div className="flex flex-col">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-12 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    
                    <div className="flex flex-col">
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                </svg>
                            </span>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full h-12 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all text-sm"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    
                    <div className="flex flex-col">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-12 pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                            <span className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            </span>
                        </div>
                    </div>

                   
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                        I agree to the <span className="text-indigo-600 font-medium">Terms of Service</span> and <span className="text-indigo-600 font-medium">Privacy Policy</span>
                    </label>

                   
                    <button
                        type="submit"
                        className="w-full py-3.5 mt-1 text-white font-semibold bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all"
                    >
                        Create Account
                    </button>
                </form>

               
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Register