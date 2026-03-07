"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        // Also insert into profiles table
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: name,
                email,
                role: 'PATIENT'
            })
        }

        setSuccess(true)
        setLoading(false)
        // If email confirmation is disabled, redirect directly
        setTimeout(() => router.push('/dashboard/patient'), 2000)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row-reverse overflow-hidden">
            {/* Form Column */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12">
                <div className="max-w-sm w-full">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Create account</h1>
                    <p className="text-gray-500 text-sm mb-10 font-medium">Start your journey to better health today.</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-3 mb-6 text-xs font-medium"
                        >
                            <AlertCircle size={14} /> {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl px-4 py-3 mb-6 text-xs font-medium"
                        >
                            <CheckCircle2 size={14} /> Account created! Redirecting to your dashboard...
                        </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-gray-400">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full bg-white border-b-2 border-gray-100 py-3 pl-8 text-sm focus:border-medical-blue outline-none transition-all placeholder:text-gray-200"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Create Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-white border-b-2 border-gray-100 py-3 pl-8 text-sm focus:border-medical-blue outline-none transition-all placeholder:text-gray-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="btn-primary w-full py-4 text-sm font-bold shadow-xl shadow-medical-blue/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? 'Creating account...' : (
                                <>Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-xs text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-medical-blue font-bold hover:underline">Sign In</Link>
                    </div>
                </div>
            </div>

            {/* Visual Column */}
            <div className="hidden md:block flex-1 bg-medical-blue relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-16 text-center">
                    <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight italic">Empowering your<br />health journey.</h2>
                    <p className="text-white/60 max-w-sm leading-relaxed text-sm font-medium">Create a secure profile, book specialists in seconds, and keep your medical records organized in one place.</p>
                </div>
            </div>
        </div>
    )
}
