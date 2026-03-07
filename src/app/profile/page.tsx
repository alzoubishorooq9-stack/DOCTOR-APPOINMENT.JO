"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Bell, Lock, Camera, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        fetch('/api/patient/profile')
            .then(res => res.json())
            .then(data => {
                setProfile(data)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div></div>

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/dashboard/patient" className="text-gray-500 hover:text-medical-blue">Dashboard</Link>
                    <div className="w-8 h-8 rounded-lg bg-soft-cyan text-medical-blue font-bold flex items-center justify-center text-xs">A</div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <header className="mb-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] bg-white shadow-xl overflow-hidden border-4 border-white">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-2 right-2 w-10 h-10 bg-medical-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-medical-blue/30 border-4 border-white hover:scale-110 transition-transform">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Ammee Richards</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2 italic">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                Verified Patient
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100 italic">
                                Premium Member
                            </span>
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Nav */}
                    <nav className="space-y-2">
                        <ProfileNavItem icon={<User size={18} />} label="Personal Information" active />
                        <ProfileNavItem icon={<Lock size={18} />} label="Security" />
                        <ProfileNavItem icon={<Bell size={18} />} label="Notifications" />
                        <ProfileNavItem icon={<Shield size={18} />} label="Privacy & Data" />
                    </nav>

                    {/* Form */}
                    <div className="md:col-span-3">
                        <div className="glass-card p-8">
                            <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">Personal Information</h3>

                            <form className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <InputGroup label="Full Name" value="Ammee Richards" placeholder="John Doe" />
                                    <InputGroup label="Email Address" value="ammee@example.com" placeholder="name@email.com" />
                                    <InputGroup label="Phone Number" value="+1 (555) 000-0000" placeholder="+1..." />
                                    <InputGroup label="Date of Birth" value="1992-05-15" placeholder="YYYY-MM-DD" type="date" />
                                </div>

                                <div className="pt-8 border-t border-gray-50 space-y-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Context (Optional)</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputGroup label="Blood Type" value="O+" placeholder="Type..." />
                                        <InputGroup label="Known Allergies" value="Penicillin, Pollen" placeholder="List allergies..." />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end gap-4">
                                    <button type="button" className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors italic">Discard Changes</button>
                                    <button type="submit" className="btn-primary px-8 py-3 text-xs font-bold shadow-lg shadow-medical-blue/20">Save Profile Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ProfileNavItem({ icon, label, active = false }: any) {
    return (
        <button className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all group ${active ? 'bg-medical-blue text-white shadow-xl shadow-medical-blue/10' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}>
            <div className="flex items-center gap-3">
                {icon}
                {label}
            </div>
            {!active && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
    )
}

function InputGroup({ label, value, placeholder, type = "text" }: any) {
    return (
        <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">{label}</label>
            <input
                type={type}
                defaultValue={value}
                placeholder={placeholder}
                className="w-full bg-white border-b-2 border-gray-100 py-2.5 text-sm focus:border-medical-blue outline-none transition-all font-medium placeholder:text-gray-200"
            />
        </div>
    )
}
