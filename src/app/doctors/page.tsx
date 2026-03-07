"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FilterPanel from '@/patient-frontend/components/FilterPanel'
import DoctorCard from '@/patient-frontend/components/DoctorCard'
import Link from 'next/link'

export default function DoctorDiscovery() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [specialties, setSpecialties] = useState(['All'])
    const [activeSpecialty, setActiveSpecialty] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Fetch Specialties
        fetch('/api/specialties')
            .then(res => res.json())
            .then(data => setSpecialties(data))

        // 2. Fetch Doctors
        setLoading(true)
        const url = activeSpecialty === 'All'
            ? '/api/patient/doctors'
            : `/api/patient/doctors?specialty=${activeSpecialty}`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setDoctors(data)
                } else {
                    console.error('API Error:', data?.error || 'Invalid data structure received')
                    setDoctors([])
                }
                setLoading(false)
            })
    }, [activeSpecialty])

    return (
        <div className="min-h-screen bg-white">
            {/* Mini Nav Header */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="relative group flex-1 hidden md:block min-w-[300px]">
                        <input
                            type="text"
                            placeholder="Search doctors, clinics, hospitals..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-medical-blue/20 focus:bg-white transition-all text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                    <Link href="/dashboard/patient" className="text-gray-600 hover:text-medical-blue">My Appointments</Link>
                    <div className="w-8 h-8 rounded-full bg-soft-cyan border border-medical-blue/10"></div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 md:px-12">
                {/* Breadcrumb / Title */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Home › Doctors › {activeSpecialty}</div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase">
                            {activeSpecialty === 'All' ? 'Our Specialists' : `${activeSpecialty}s`} in New York
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">{Array.isArray(doctors) ? doctors.length : 0} doctors available</div>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar */}
                    <FilterPanel
                        specialties={specialties}
                        activeSpecialty={activeSpecialty}
                        onSpecialtyChange={(s) => setActiveSpecialty(s)}
                    />

                    {/* Main List */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="glass-card h-80 shimmer opacity-50"></div>
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {(!Array.isArray(doctors) || doctors.length === 0) ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className="text-4xl mb-4">👩‍⚕️</div>
                                        <p className="text-gray-500 max-w-sm">
                                            We couldn't find a specialist matching your search. Try adjusting the filters for more options.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {Array.isArray(doctors) && doctors.map((doc: any) => (
                                            <DoctorCard
                                                key={doc.id}
                                                id={doc.id}
                                                name={doc.profiles?.full_name || 'Specialist'}
                                                specialty={doc.specialty}
                                                degree={doc.degree || 'MD'}
                                                experience={doc.experience_years || 5}
                                                location={doc.location || 'New York Medical Center'}
                                                fee={doc.consultation_fee || 100}
                                                rating={doc.rating || 4.8}
                                                reviewsCount={doc.reviews_count || 50}
                                                imageUrl={doc.profiles?.avatar_url || doc.image_url}
                                            />
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
