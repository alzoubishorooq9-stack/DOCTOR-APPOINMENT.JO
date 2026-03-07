"use client"

import { useState, useEffect } from 'react'
import { Users, CalendarCheck, Clock, ArrowRight, ClipboardList, Stethoscope } from 'lucide-react'
import Link from 'next/link'

type Booking = {
    id: string
    appointment_date: string
    appointment_time: string
    status: string
    patient: { full_name: string; avatar_url?: string; phone_number?: string }
    services: { name: string; price: number; duration_mins: number }
}

export default function DoctorOverview() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/doctor/bookings')
            .then(res => res.json())
            .then(data => {
                setBookings(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const todayStr = new Date().toISOString().split('T')[0]

    // Calculate metrics
    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const todaysBookings = bookings.filter(b => b.appointment_date === todayStr && b.status === 'confirmed')

    // Simple unique patient counter based on patient_id (assuming bookings have it; if not, by name)
    const uniquePatients = new Set(bookings.map(b => b.patient?.full_name)).size

    const STATS = [
        { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: "Today's Agenda", value: todaysBookings.length, icon: CalendarCheck, color: 'text-medical-blue', bg: 'bg-blue-50' },
        { label: 'Total Patients', value: uniquePatients, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ]

    function formatTime(t: string) {
        if (!t) return ''
        const [h, m] = t.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Welcome back, Dr. Medica. You are in control of your clinical practice.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATS.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                            <s.icon size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
                            <div className="text-4xl font-black text-gray-900 leading-tight">{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Morning Digest / Today */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Today's Agenda</h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Your confirmed appointments for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Loading agenda...</div>
                    ) : todaysBookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <CalendarCheck size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-sm font-medium">No appointments scheduled for today.</p>
                        </div>
                    ) : (
                        todaysBookings.map(b => (
                            <div key={b.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="text-right w-20">
                                        <div className="font-bold text-gray-900">{formatTime(b.appointment_time)}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.services?.duration_mins} MIN</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {b.patient?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{b.patient?.full_name}</div>
                                        <div className="text-xs font-semibold text-medical-blue">{b.services?.name}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                                    {b.services?.price} JOD
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/doctor/bookings" className="group bg-gradient-to-br from-medical-blue to-[#1e4eb8] rounded-2xl p-6 text-white shadow-lg shadow-medical-blue/20 hover:shadow-xl hover:shadow-medical-blue/30 transition-all relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <ClipboardList size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Manage Requests</h3>
                        <p className="text-blue-100 text-sm mb-6">Review pending appointments and manage your schedule.</p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                            View Bookings <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </Link>

                <Link href="/dashboard/doctor/services" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                        <Stethoscope size={20} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Service & Pricing</h3>
                    <p className="text-gray-500 text-sm mb-6">Add or modify the clinical services and consultations you offer.</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        Manage Services <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>
        </div>
    )
}
