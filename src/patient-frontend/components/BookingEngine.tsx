"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function BookingEngine({ doctorId, fee }: { doctorId: string, fee: number }) {
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [slots, setSlots] = useState<string[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [services, setServices] = useState<any[]>([])
    const [selectedService, setSelectedService] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const [isBooking, setIsBooking] = useState(false)
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // Generate next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return d.toISOString().split('T')[0]
    })

    useEffect(() => {
        setLoading(true)
        // Fetch Slots
        const fetchSlots = fetch(`/api/patient/doctors/${doctorId}/slots?date=${selectedDate}`).then(res => res.json())
        // Fetch Doctor details for Services
        const fetchDoctor = fetch(`/api/patient/doctors/${doctorId}`).then(res => res.json())

        Promise.all([fetchSlots, fetchDoctor])
            .then(([slotsData, doctorData]) => {
                // Deduplicate slots using a Set to prevent duplicate key errors
                const uniqueSlots = Array.from(new Set<string>(Array.isArray(slotsData) ? slotsData : []))
                setSlots(uniqueSlots)
                if (doctorData.services) {
                    setServices(doctorData.services)
                    if (!selectedService && doctorData.services.length > 0) {
                        setSelectedService(doctorData.services[0])
                    }
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [selectedDate, doctorId])

    const [bookingError, setBookingError] = useState<string | null>(null)

    const handleBooking = async () => {
        if (!selectedSlot || isBooking) return

        setIsBooking(true)
        setBookingError(null)
        try {
            // Ensure time is in HH:MM:SS format for Postgres TIME column
            const timeForDB = selectedSlot.includes(':') && selectedSlot.split(':').length === 2
                ? `${selectedSlot}:00`
                : selectedSlot

            const res = await fetch('/api/patient/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    service_id: selectedService?.id || null,
                    appointment_date: selectedDate,
                    appointment_time: timeForDB,
                    total_price: selectedService?.price || fee,
                    reason: selectedService?.name || 'Consultation'
                })
            })

            const json = await res.json()

            if (res.ok) {
                setBookingStatus('success')
                setTimeout(() => {
                    router.push('/bookings')
                }, 1800)
            } else {
                console.error('[Booking failed]', json)
                setBookingError(json?.error || 'Booking failed. Please try again.')
                setBookingStatus('error')
                setIsBooking(false)
            }
        } catch (e) {
            console.error('[Booking exception]', e)
            setBookingError('Network error. Please check your connection.')
            setBookingStatus('error')
            setIsBooking(false)
        }
    }


    if (bookingStatus === 'success') {
        return (
            <div className="glass-card p-12 sticky top-24 shadow-xl border-gray-100/50 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-emerald-500/20"
                >
                    ✓
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                <p className="text-sm text-gray-500">Waiting for doctor's approval. Redirecting...</p>
            </div>
        )
    }

    return (
        <div className="glass-card sticky top-24 shadow-xl border-gray-100/50 flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto p-6 pb-4 scrollbar-none">
                {/* Price header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Consultation Price</span>
                        <div className="text-2xl font-black text-gray-900">{selectedService?.price || fee} JOD <span className="text-xs text-gray-400 font-medium">/ visit</span></div>
                    </div>
                    <div className="bg-emerald-50 text-emerald-success text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 uppercase">
                        Instant Pulse
                    </div>
                </div>

                {/* Service Selector */}
                {services.length > 1 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Select Service</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedService(s)}
                                    className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${selectedService?.id === s.id ? 'bg-medical-blue/5 border-medical-blue text-medical-blue' : 'bg-white border-gray-100 text-gray-600 hover:border-medical-blue/20'}`}
                                >
                                    <span>{s.name}</span>
                                    <span className="opacity-60">{s.price} JOD</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date Selector */}
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Select Date</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {next7Days.map(date => {
                            const d = new Date(date)
                            const isSelected = selectedDate === date
                            return (
                                <button
                                    key={date}
                                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                                    className={`flex-none w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <span className="text-[10px] font-medium uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <span className="text-lg font-black">{d.getDate()}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Slots — capped height so button stays visible */}
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Available Slots</h4>
                    {loading ? (
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-xl"></div>)}
                        </div>
                    ) : slots.length > 0 ? (
                        <div className="max-h-[200px] overflow-y-auto scrollbar-none">
                            <div className="grid grid-cols-2 gap-3 pr-1">
                                {slots.map((slot, index) => (
                                    <button
                                        key={`${slot}-${index}`}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${selectedSlot === slot ? 'bg-medical-blue border-medical-blue text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-medical-blue/30'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <div className="text-xl mb-2">😴</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No slots available</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Pinned bottom — always visible ── */}
            <div className="p-6 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm rounded-b-3xl">
                {bookingStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">
                        {bookingError || 'Booking failed. Please try again.'}
                    </div>
                )}
                <button
                    className={`w-full py-4 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${(!selectedSlot || isBooking)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-medical-blue text-white shadow-xl shadow-medical-blue/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    disabled={!selectedSlot || isBooking}
                    onClick={handleBooking}
                >
                    {isBooking ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : 'Request Appointment'}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 font-medium italic">Powered by HealthBook Premium Secure</p>
                <p className="text-[10px] text-gray-400 text-center mt-1">🛡️ Your booking is secure and instant.</p>
            </div>
        </div>
    )
}
