"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

interface DoctorCardProps {
    id: string
    name: string
    specialty: string
    degree: string
    experience: number
    location: string
    fee: number
    rating: number
    reviewsCount: number
    imageUrl?: string
    status?: string
}

export default function DoctorCard({
    id,
    name,
    specialty,
    degree,
    experience,
    location,
    fee,
    rating,
    reviewsCount,
    imageUrl,
    status = "Available Today"
}: DoctorCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="glass-card overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white">
                            <img
                                src={imageUrl || "https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=200"}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <span className="text-amber-500 text-xs font-bold">★ {rating}</span>
                        <span className="text-gray-400 text-[10px]">{reviewsCount}+ Reviews</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-medical-blue transition-colors">Dr. {name}</h3>
                <p className="text-sm font-semibold text-medical-blue mb-1">{specialty}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">{degree} • {experience} years exp</p>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="grayscale opacity-50">📍</span>
                        {location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="grayscale opacity-50">💵</span>
                        {fee} JOD Consultation Fee
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-success font-medium">
                        <span className="grayscale-0">📅</span>
                        {status}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Link href={`/doctors/${id}`} className="btn-secondary py-2 px-0 text-center text-xs">
                        View Profile
                    </Link>
                    <Link href={`/doctors/${id}?book=true`} className="btn-primary py-2 px-0 text-center text-xs">
                        Book
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
