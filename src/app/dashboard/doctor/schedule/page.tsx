"use client"

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react'

type Slot = {
    id?: string
    date: string
    start_time: string
    is_booked?: boolean
}

export default function AvailabilityManager() {
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(true)

    // Form states
    const today = new Date().toISOString().split('T')[0]
    const [selectedDate, setSelectedDate] = useState(today)
    const [newTime, setNewTime] = useState('09:00')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchSchedule()
    }, [selectedDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            // Only fetch for the selected week or so, but let's just fetch all future for simplicity, or specific date.
            const res = await fetch(`/api/doctor/availability?startDate=${selectedDate}`)
            const data = await res.json()
            setSlots(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const timeWithSeconds = newTime.length === 5 ? `${newTime}:00` : newTime
            await fetch('/api/doctor/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    start_time: timeWithSeconds
                })
            })
            await fetchSchedule()
        } catch (e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteSlot = async (id: string, isBooked: boolean) => {
        if (isBooked) {
            alert("Cannot delete a slot that is already booked.")
            return
        }
        try {
            await fetch(`/api/doctor/availability/${id}`, { method: 'DELETE' })
            setSlots(prev => prev.filter(s => s.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    // Grouping slots by date to show a nice list
    const visibleSlots = slots.filter(s => s.date === selectedDate).sort((a, b) => a.start_time.localeCompare(b.start_time))

    function formatTime(t: string) {
        if (!t) return ''
        const [h, m] = t.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Availability Settings</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Define your working days and active time slots so patients can book you.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Setup Form */}
                <div className="lg:col-span-1 border border-gray-100 bg-white rounded-2xl p-6 shadow-sm h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CalendarIcon size={18} className="text-medical-blue" /> Select Day
                    </h2>
                    <form onSubmit={handleAddSlot} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Date</label>
                            <input
                                type="date"
                                required
                                min={today}
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="time"
                                    required
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary w-full py-2.5 flex justify-center items-center gap-2"
                        >
                            <Plus size={18} /> {isSaving ? 'Adding...' : 'Add Slot'}
                        </button>
                    </form>
                </div>

                {/* Right Col: Current Slots */}
                <div className="lg:col-span-2 border border-gray-100 bg-white rounded-2xl p-6 shadow-sm min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">
                            Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h2>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                            {visibleSlots.length} Slots
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading schedule...</div>
                    ) : visibleSlots.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                            <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-600">No time slots configured.</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Patients cannot book you on this day until you add availability.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {visibleSlots.map(slot => (
                                <div key={slot.id} className={`relative group p-3 rounded-xl border flex items-center justify-between transition-all ${slot.is_booked ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-200 hover:border-medical-blue/30'}`}>
                                    <span className={`text-sm font-bold ${slot.is_booked ? 'text-medical-blue' : 'text-gray-700'}`}>
                                        {formatTime(slot.start_time)}
                                    </span>

                                    {slot.is_booked ? (
                                        <div className="w-6 h-6 rounded-full bg-medical-blue/10 text-medical-blue flex items-center justify-center items-center tooltip-trigger group/tooltip">
                                            <CheckCircle2 size={12} />
                                            {/* Tooltip simple */}
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity text-center z-10 w-fit shrink-0">
                                                Booked
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteSlot(slot.id!, !!slot.is_booked)}
                                            className="w-6 h-6 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
