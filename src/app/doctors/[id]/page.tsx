"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BookingEngine from '@/patient-frontend/components/BookingEngine'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DoctorProfile() {
    const { id } = useParams()
    const [doctor, setDoctor] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState('About')

    useEffect(() => {
        fetch(`/api/patient/doctors/${id}`)
            .then(res => res.json())
            .then(data => {
                setDoctor(data)
                setLoading(false)
            })
    }, [id])

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div></div>
    if (!doctor) return <div>Doctor not found</div>

    const renderTabContent = () => {
        switch (activeTab) {
            case 'About':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                        <p className="text-gray-500 leading-relaxed text-sm mb-8">
                            {doctor.about || doctor.bio || `Dr. ${doctor.profiles?.full_name || 'Provider'} is a board-certified specialist dedicated to providing exceptional care.`}
                        </p>
                    </motion.div>
                )
            case 'Specializations':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Services & Procedures</h3>
                        <div className="flex flex-wrap gap-3">
                            {(doctor.services && doctor.services.length > 0) ? (
                                doctor.services.map((s: any) => (
                                    <div key={s.id} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold border border-transparent hover:border-medical-blue/20 transition-all cursor-default flex justify-between items-center gap-4">
                                        <span>{s.name}</span>
                                        <span className="text-medical-blue/60 text-[10px]">{s.price} JOD</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-xs italic">No specific services listed.</div>
                            )}
                        </div>
                    </motion.div>
                )
            case 'Reviews':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Patient Feedbacks</h3>
                            <div className="text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                Total {doctor.reviews_count || (doctor.reviews?.length || 0)} Reviews
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {(doctor.reviews && doctor.reviews.length > 0) ? (
                                doctor.reviews.map((rev: any) => (
                                    <ReviewCard
                                        key={rev.id}
                                        name={rev.profiles?.full_name || "Verified Patient"}
                                        rating={rev.rating || 5}
                                        text={rev.content || rev.comment || "Great experience!"}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-100">
                                    <span className="text-gray-400 text-xs italic">No reviews yet for this provider.</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            case 'Locations':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Clinic Locations</h3>
                        <div className="p-6 border border-gray-100 rounded-3xl bg-soft-cyan/20">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-medical-blue text-xl">📍</div>
                                <div>
                                    <div className="font-bold text-gray-900">{doctor.location}</div>
                                    <div className="text-sm text-gray-500">Practice Location</div>
                                </div>
                            </div>
                            <div className="aspect-video w-full bg-gray-100 rounded-2xl mb-4 overflow-hidden relative border border-gray-100">
                                <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-medical-blue/5 flex items-center justify-center">
                                    <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold shadow-lg">Interactive Map Coming Soon</div>
                                </div>
                            </div>
                            <button className="btn-primary w-full py-3 text-xs">Get Directions</button>
                        </div>
                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Nav Header */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/doctors" className="text-gray-500 hover:text-medical-blue">Find Doctors</Link>
                    <Link href="/bookings" className="text-gray-600 hover:text-medical-blue">My Appointments</Link>
                    <div className="w-8 h-8 rounded-full bg-soft-cyan border border-medical-blue/10"></div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 md:px-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2">
                        {/* Header Card */}
                        <div className="relative mb-12">
                            <div className="h-48 rounded-3xl bg-linear-to-r from-soft-cyan to-white border border-gray-100 overflow-hidden">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1A56DB 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            </div>
                            <div className="px-8 -mt-20 flex flex-col md:flex-row items-end gap-6">
                                <div className="w-40 h-40 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gray-100 flex-none relative">
                                    <img
                                        src={doctor.profiles?.avatar_url || doctor.image_url || "https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=300"}
                                        alt={doctor.profiles?.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                                </div>
                                <div className="pb-4 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dr. {doctor.profiles?.full_name}</h1>
                                        <div className="bg-amber-50 text-amber-500 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-100">
                                            ★ {doctor.rating || '4.9'}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                                        <span className="font-bold text-medical-blue uppercase tracking-wider">{doctor.specialty}, {doctor.degree || 'MD'}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="flex items-center gap-1 group">📍 {doctor.location || 'New York Medical Center'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-emerald-success">
                                        <span className="flex items-center gap-1">✅ Verified Provider</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-medical-blue">{doctor.experience_years || doctor.experienceYears || '5+'} Years Experience</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="flex items-center gap-1 text-gray-400">💬 English, Arabic</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="space-y-12">
                            <section>
                                <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto scrollbar-none pb-1">
                                    {['About', 'Specializations', 'Reviews', 'Locations'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-medical-blue' : 'text-gray-400 hover:text-gray-900'}`}>
                                            {tab}
                                            {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-blue rounded-full"></motion.div>}
                                        </button>
                                    ))}
                                </div>

                                {activeTab === 'About' && (
                                    <div className="flex items-center justify-between mb-8 -mt-4">
                                        <div className="flex-1"></div>
                                        <button onClick={() => setActiveTab('Reviews')} className="text-medical-blue text-xs font-bold hover:underline">View all {doctor.reviews_count || 124} reviews</button>
                                    </div>
                                )}

                                {renderTabContent()}
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Booking */}
                    <div className="relative">
                        <BookingEngine doctorId={doctor.id} fee={doctor.consultation_fee || 150} />

                        <div className="mt-8 glass-card p-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Clinic Location</h4>
                            <div className="aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-medical-blue/10 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-medical-blue">📍</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-gray-900 mb-1">New York Medical Center</div>
                            <div className="text-[10px] text-gray-400 mb-4">123 Medical Plaza, Manhattan, NY 10001</div>
                            <button className="text-medical-blue text-[10px] font-bold hover:underline flex items-center gap-1">Get Directions ↗</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ReviewCard({ name, rating, text }: { name: string, rating: number, text: string }) {
    return (
        <div className="border border-gray-100 rounded-3xl p-6 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-soft-cyan text-medical-blue font-bold flex items-center justify-center text-sm">{name[0]}</div>
                    <div>
                        <div className="text-sm font-bold text-gray-900">{name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">visited for Regular Checkup</div>
                    </div>
                </div>
                <div className="text-[10px] text-gray-400">2 weeks ago</div>
            </div>
            <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={`text-xs ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                ))}
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
        </div>
    )
}
