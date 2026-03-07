"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react'

type Service = {
    id: string
    name: string
    price: number
    duration_mins: number
}

export default function ServicesManager() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [form, setForm] = useState({ name: '', price: '', duration_mins: '30' })
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/doctor/services')
            const data = await res.json()
            setServices(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const payload = {
            name: form.name,
            price: Number(form.price),
            duration_mins: Number(form.duration_mins)
        }

        try {
            if (editingId) {
                await fetch(`/api/doctor/services/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                await fetch('/api/doctor/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }
            await fetchServices()
            setIsAdding(false)
            setEditingId(null)
            setForm({ name: '', price: '', duration_mins: '30' })
        } catch (e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return
        try {
            await fetch(`/api/doctor/services/${id}`, { method: 'DELETE' })
            setServices(prev => prev.filter(s => s.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    const handleEdit = (s: Service) => {
        setEditingId(s.id)
        setForm({ name: s.name, price: String(s.price), duration_mins: String(s.duration_mins) })
        setIsAdding(true)
    }

    const cancelForm = () => {
        setIsAdding(false)
        setEditingId(null)
        setForm({ name: '', price: '', duration_mins: '30' })
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Services & Pricing</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Manage the clinical services and consultations you offer to patients.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary py-2.5 px-5 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} /> Add New Service
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading services...</div>
                ) : isAdding ? (
                    <div className="p-8">
                        <div className="max-w-xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Service Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Initial Consultation"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Price (JOD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">JOD</span>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.price}
                                                onChange={e => setForm({ ...form, price: e.target.value })}
                                                className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Duration (Minutes)</label>
                                        <div className="relative">
                                            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="number"
                                                min="5"
                                                step="5"
                                                value={form.duration_mins}
                                                onChange={e => setForm({ ...form, duration_mins: e.target.value })}
                                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn-primary py-2.5 px-6 flex-1 flex justify-center items-center"
                                    >
                                        {isSaving ? 'Saving...' : (editingId ? 'Update Service' : 'Save Service')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelForm}
                                        className="py-2.5 px-6 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Services Yet</h3>
                        <p className="text-sm max-w-sm mx-auto mb-6">You haven't added any services to your profile yet. Add your first consultation type to allow patients to book.</p>
                        <button onClick={() => setIsAdding(true)} className="btn-primary py-2.5 px-6 mx-auto inline-flex items-center gap-2">
                            <Plus size={18} /> Add Your First Service
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {/* List Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs uppercase font-black text-gray-400 tracking-wider">
                            <div className="col-span-5 md:col-span-6">Service Name</div>
                            <div className="col-span-3 md:col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right md:text-center">Duration</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* List Items */}
                        {services.map((s) => (
                            <div key={s.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-5 md:col-span-6">
                                    <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                                </div>
                                <div className="col-span-3 md:col-span-2 text-right font-medium text-gray-900">
                                    {s.price} JOD
                                </div>
                                <div className="col-span-2 text-right md:text-center text-sm font-medium text-gray-500">
                                    {s.duration_mins}m
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-2 sm:gap-4">
                                    <button onClick={() => handleEdit(s)} className="text-medical-blue hover:text-blue-700 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-700 p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
