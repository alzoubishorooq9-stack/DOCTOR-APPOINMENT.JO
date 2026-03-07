"use client"

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, Clock4, User, Search } from 'lucide-react'

type Booking = {
    id: string
    patient_id: string
    service_id: string
    appointment_date: string
    appointment_time: string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    created_at: string
    // Joined data from backend
    patient?: {
        full_name: string
        phone_number: string
        avatar_url?: string
    }
    services?: {
        name: string
        price: number
    }
}

export default function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'>('ALL')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/doctor/bookings')
            const data = await res.json()
            setBookings(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/doctor/bookings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                const updated = await res.json()
                // Update local state with the normalized status from server
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: updated.status } : b))
            } else {
                alert("Failed to update status")
            }
        } catch (e) {
            console.error(e)
            alert("Failed to update status")
        }
    }

    const filteredBookings = bookings.filter(b => {
        const s = b.status?.toUpperCase()
        if (filter === 'ALL') return true
        return s === filter
    }).sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`).getTime() - new Date(`${a.appointment_date}T${a.appointment_time}`).getTime())

    const getStatusStyle = (status: string) => {
        const _s = status.toUpperCase()
        if (_s === 'PENDING') return 'bg-amber-100 text-amber-700 border-amber-200'
        if (_s === 'CONFIRMED') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        if (_s === 'CANCELLED') return 'bg-rose-100 text-rose-700 border-rose-200'
        if (_s === 'COMPLETED') return 'bg-gray-100 text-gray-700 border-gray-200'
        return 'bg-gray-100 text-gray-700'
    }

    const getStatusIcon = (status: string) => {
        const _s = status.toUpperCase()
        if (_s === 'PENDING') return <Clock4 size={14} className="mr-1" />
        if (_s === 'CONFIRMED') return <CheckCircle size={14} className="mr-1" />
        if (_s === 'CANCELLED') return <XCircle size={14} className="mr-1" />
        if (_s === 'COMPLETED') return <CheckCircle size={14} className="mr-1" />
        return null
    }

    function formatTime(t: string) {
        if (!t) return ''
        const [h, m] = t.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Interaction Engine</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Manage your patient appointments and requests.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-white text-medical-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 font-medium">Loading appointments...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-24 px-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Bookings Found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} appointments to show right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredBookings.map(booking => (
                            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                {/* Left: Pat Info & Service */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
                                        <User size={24} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="flex gap-2 items-center mb-1">
                                            <h4 className="font-bold text-gray-900">{booking.patient?.full_name || 'Unknown Patient'}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center ${getStatusStyle(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">{booking.services?.name || 'Consultation'}</p>
                                        <p className="text-xs text-gray-400 mt-1">{booking.patient?.phone_number || 'No phone provided'}</p>
                                    </div>
                                </div>

                                {/* Right: Time & Actions */}
                                <div className="flex flex-col md:items-end gap-3 md:basis-1/3 shrink-0">
                                    <div className="flex items-center gap-4 text-sm font-semibold text-gray-700 bg-white border border-gray-100 px-3 py-2 rounded-xl shadow-sm w-fit">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-medical-blue" /> {new Date(booking.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-medical-blue" /> {formatTime(booking.appointment_time)}</span>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                        {booking.status.toUpperCase() === 'PENDING' && (
                                            <>
                                                <button onClick={() => updateStatus(booking.id, 'CANCELLED')} className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                                    Decline
                                                </button>
                                                <button onClick={() => updateStatus(booking.id, 'CONFIRMED')} className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-medical-blue hover:bg-blue-700 shadow-sm shadow-blue-500/20 rounded-lg transition-all active:scale-95">
                                                    Accept Visit
                                                </button>
                                            </>
                                        )}
                                        {booking.status.toUpperCase() === 'CONFIRMED' && (
                                            <button onClick={() => updateStatus(booking.id, 'COMPLETED')} className="w-full md:w-auto px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex justify-center items-center gap-2">
                                                <CheckCircle size={16} /> Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
