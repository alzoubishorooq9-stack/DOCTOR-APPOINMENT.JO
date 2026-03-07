"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
    const [search, setSearch] = useState('')

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-sm sticky top-0 z-50 bg-white/80">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <Link href="/doctors" className="hover:text-medical-blue transition-colors">Find Doctors</Link>
                    <Link href="/telehealth" className="hover:text-medical-blue transition-colors">Video Consult</Link>
                    <Link href="/medicines" className="hover:text-medical-blue transition-colors">Medicines</Link>
                    <Link href="/lab-tests" className="hover:text-medical-blue transition-colors">Lab Tests</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="btn-primary py-2 px-5 text-sm">Login / Signup</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative px-6 pt-16 pb-24 md:px-12 md:pt-24 max-w-7xl mx-auto overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="z-10"
                        >
                            <div className="inline-flex items-center px-3 py-1 bg-soft-cyan text-medical-blue rounded-full text-xs font-semibold mb-6 gap-2">
                                <span className="p-1 bg-medical-blue/10 rounded-full">🛡️</span>
                                TRUSTED HEALTHCARE
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                                Healthcare at <br />
                                <span className="text-medical-blue">your fingertips</span>
                            </h1>

                            <p className="text-gray-500 text-lg mb-10 max-w-md">
                                Find the right specialist near you and book an appointment instantly. Trusted by thousands of patients for reliable care.
                            </p>

                            {/* Search Bar */}
                            <div className="glass-card p-2 flex flex-col md:flex-row gap-2 max-w-2xl shadow-xl border-gray-100/50">
                                <div className="flex-1 flex items-center px-4 gap-3">
                                    <span className="text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Doctors, clinics, hospitals..."
                                        className="w-full py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="w-[1px] bg-gray-100 hidden md:block"></div>
                                <div className="flex-1 flex items-center px-4 gap-3">
                                    <span className="text-gray-400">📍</span>
                                    <input
                                        type="text"
                                        placeholder="New York, NY"
                                        className="w-full py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <Link href={`/doctors?q=${search}`} className="btn-primary flex items-center justify-center">
                                    Search
                                </Link>
                            </div>

                            {/* Popular Tags */}
                            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-400">
                                <span>Popular:</span>
                                <Link href="/doctors?specialty=Dermatologist" className="text-gray-600 underline decoration-gray-200 underline-offset-4 hover:text-medical-blue transition-colors">Dermatologist</Link>
                                <Link href="/doctors?specialty=Pediatrician" className="text-gray-600 underline decoration-gray-200 underline-offset-4 hover:text-medical-blue transition-colors">Pediatrician</Link>
                                <Link href="/doctors?specialty=Gynecologist" className="text-gray-600 underline decoration-gray-200 underline-offset-4 hover:text-medical-blue transition-colors">Gynecologist</Link>
                            </div>

                            {/* Stats */}
                            <div className="mt-16 grid grid-cols-3 gap-8">
                                <div>
                                    <div className="text-2xl font-black text-gray-900">10k+</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Verified Doctors</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">500k+</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Happy Patients</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">4.8/5</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">App Rating</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Image/Illustration */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative hidden md:block"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-medical-blue/20 to-transparent rounded-[3rem] blur-3xl -z-10 transform rotate-12"></div>
                            <div className="glass-card aspect-[4/5] relative overflow-hidden p-4">
                                <img
                                    src="https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=800"
                                    alt="Doctor"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                                <div className="absolute top-8 right-8 glass-card py-2 px-4 shadow-lg flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-700">Happy Patients</span>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 glass-card p-4 shadow-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-success/10 text-emerald-success rounded-full flex items-center justify-center text-xl">
                                        ✅
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Appointment Confirmed</div>
                                        <div className="text-[10px] text-gray-500">Dr. Sarah Johnson • 10:00 AM</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature Grid Below Hero */}
                    <div className="mt-32 grid md:grid-cols-3 gap-6">
                        <FeatureCard title="Find Doctors" icon="🔍" text="Search for doctors by specialty, location, or name. Filter by insurance and availability." />
                        <FeatureCard title="Book Appointments" icon="📅" text="Schedule in-person or video consultations instantly. No waiting on hold." />
                        <FeatureCard title="Get Care" icon="🏥" text="Receive prescriptions, lab orders, and follow-up care directly through the platform." />
                    </div>
                </section>
            </main>

            {/* Footer Minimal */}
            <footer className="px-6 py-12 md:px-12 border-t border-gray-100 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center bg-white text-gray-400 text-sm gap-4">
                <div>© 2026 HealthBook. Your data is secure and encrypted.</div>
                <div className="flex gap-8">
                    <Link href="#" className="hover:text-medical-blue transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-medical-blue transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-medical-blue transition-colors">Contact</Link>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ title, icon, text }: { title: string, icon: string, text: string }) {
    return (
        <div className="glass-card p-8 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-xs">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
        </div>
    )
}
