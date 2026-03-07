"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Calendar, Clock, ChevronRight, ArrowLeft,
    Search, CheckCircle2, XCircle,
    AlertCircle, RotateCcw, Star, Stethoscope
} from 'lucide-react'

type Booking = {
    id: string
    doctor_id: string
    appointment_date: string
    appointment_time: string
    status: string
    reason?: string
    total_price?: number
    doctors_details?: {
        specialty: string
        location?: string
        profiles?: { full_name: string }
    }
    services?: {
        name: string
        price: number
    }
}

// Status config supports both lowercase (db) and uppercase (legacy)
const STATUS_CONFIG: Record<string, { label: string; sublabel: string; color: string; bg: string; icon: any }> = {
    pending: {
        label: 'Pending',
        sublabel: 'Awaiting doctor approval',
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        icon: AlertCircle
    },
    confirmed: {
        label: 'Confirmed',
        sublabel: 'Appointment confirmed',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200',
        icon: CheckCircle2
    },
    cancelled: {
        label: 'Cancelled',
        sublabel: 'This appointment was cancelled',
        color: 'text-rose-500',
        bg: 'bg-rose-50 border-rose-200',
        icon: XCircle
    },
    completed: {
        label: 'Completed',
        sublabel: 'Visit completed',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200',
        icon: Star
    },
}

function formatTime(t: string) {
    if (!t) return ''
    // Convert "13:00:00" → "1:00 PM"
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [cancelling, setCancelling] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/patient/bookings')
            .then(r => r.json())
            .then(data => {
                setBookings(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => { setBookings([]); setLoading(false) })
    }, [])

    const handleCancel = async (id: string) => {
        setCancelling(id)
        const res = await fetch(`/api/patient/bookings/${id}/cancel`, { method: 'PATCH' })
        if (res.ok) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
        }
        setCancelling(null)
    }

    const FILTERS = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ]

    const displayed = bookings
        .filter(b => filter === 'all' || b.status.toLowerCase() === filter)
        .filter(b => {
            if (!search) return true
            const name = b.doctors_details?.profiles?.full_name?.toLowerCase() ?? ''
            const spec = b.doctors_details?.specialty?.toLowerCase() ?? ''
            return name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase())
        })

    // Count by status
    const counts = {
        pending: bookings.filter(b => b.status.toLowerCase() === 'pending').length,
        confirmed: bookings.filter(b => b.status.toLowerCase() === 'confirmed').length,
        completed: bookings.filter(b => b.status.toLowerCase() === 'completed').length,
        cancelled: bookings.filter(b => b.status.toLowerCase() === 'cancelled').length,
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Top Nav */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center gap-4">
                <Link href="/dashboard/patient" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-sm font-bold">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-black text-gray-900">My Bookings</h1>
                </div>
                <Link href="/doctors" className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2">
                    Book New Appointment <ChevronRight size={14} />
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-10 md:px-12">

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(counts).map(([status, count]) => {
                        const cfg = STATUS_CONFIG[status]
                        const Icon = cfg.icon
                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(filter === status ? 'all' : status)}
                                className={`bg-white p-4 rounded-2xl border text-left transition-all hover:shadow-md ${filter === status ? 'border-medical-blue/40 shadow-md' : 'border-gray-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon size={13} className={cfg.color} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cfg.label}</span>
                                </div>
                                <div className="text-2xl font-black text-gray-900">{count}</div>
                            </button>
                        )
                    })}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by doctor or specialty..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-medical-blue/30 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f.key
                                    ? 'bg-medical-blue text-white border-medical-blue'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-medical-blue/30'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📅</div>
                        <h3 className="font-bold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-400 text-sm mb-8">
                            {filter !== 'all' ? `No ${filter} appointments.` : "You haven't booked any appointments yet."}
                        </p>
                        <Link href="/doctors" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
                            Find a Specialist <ChevronRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="space-y-4">
                            {displayed.map(booking => {
                                const statusKey = booking.status.toLowerCase()
                                const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['pending']
                                const Icon = cfg.icon
                                const doctorName = booking.doctors_details?.profiles?.full_name ?? 'Unknown Doctor'
                                const specialty = booking.doctors_details?.specialty ?? 'Specialist'
                                const serviceName = booking.services?.name ?? booking.reason ?? 'Consultation'
                                const price = booking.services?.price ?? booking.total_price ?? 0

                                return (
                                    <motion.div
                                        key={booking.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Doctor Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex-shrink-0 flex items-center justify-center">
                                                    <Stethoscope size={22} className="text-medical-blue/60" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{doctorName}</div>
                                                    <div className="text-[10px] text-medical-blue font-bold uppercase tracking-wider mt-0.5">{specialty}</div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                            <Calendar size={10} />
                                                            {formatDate(booking.appointment_date)}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                            <Clock size={10} />
                                                            {formatTime(booking.appointment_time)}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        {serviceName} · <span className="font-bold text-gray-600">{price} JOD</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status + Actions */}
                                            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
                                                    <Icon size={11} />
                                                    {cfg.label}
                                                </div>
                                                <div className={`text-[9px] font-medium ${cfg.color} opacity-70`}>{cfg.sublabel}</div>

                                                {statusKey === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancelling === booking.id}
                                                        className="text-[10px] font-bold text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors disabled:opacity-50 mt-1"
                                                    >
                                                        {cancelling === booking.id ? (
                                                            <><RotateCcw size={10} className="animate-spin" /> Cancelling...</>
                                                        ) : (
                                                            <><XCircle size={10} /> Cancel</>
                                                        )}
                                                    </button>
                                                )}
                                                {statusKey === 'confirmed' && (
                                                    <Link href={`/doctors/${booking.doctor_id}`} className="text-[10px] font-bold text-medical-blue hover:underline mt-1">
                                                        View Doctor →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    )
}
