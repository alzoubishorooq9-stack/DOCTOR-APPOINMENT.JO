"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            router.push('/dashboard/patient')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12">
                <div className="max-w-sm w-full">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Welcome back</h1>
                    <p className="text-gray-500 text-sm mb-10 font-medium">Please enter your details to access your dashboard.</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-3 mb-6 text-xs font-medium"
                        >
                            <AlertCircle size={14} />
                            {error}
                        </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white border-b-2 border-gray-100 py-3 pl-8 text-sm focus:border-medical-blue outline-none transition-all placeholder:text-gray-200"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Password</label>
                                <Link href="#" className="text-[10px] font-bold text-medical-blue hover:underline">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white border-b-2 border-gray-100 py-3 pl-8 text-sm focus:border-medical-blue outline-none transition-all placeholder:text-gray-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-sm font-bold shadow-xl shadow-medical-blue/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? 'Signing in...' : (
                                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-xs text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-medical-blue font-bold hover:underline">Create an account</Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Visual/Hero */}
            <div className="hidden md:block flex-1 bg-medical-blue relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-16 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-12 relative"
                    >
                        <div className="w-64 h-64 rounded-[40px] bg-white/10 backdrop-blur-3xl p-8 border border-white/20">
                            <div className="w-full h-full rounded-[30px] bg-white/20 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-medical-blue font-black text-3xl shadow-2xl shadow-medical-blue/50">+</div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-50"></div>
                    </motion.div>
                    <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">Expert Care,<br />One Click Away.</h2>
                    <p className="text-white/60 max-w-sm leading-relaxed text-sm font-medium">Join over 10,000 satisfied patients managing their health journey through HealthBook.</p>
                </div>
            </div>
        </div>
    )
}
