"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react'

export default function BookingSuccess() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center"
            >
                <div className="mb-8 flex justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10"
                    >
                        <CheckCircle2 size={48} strokeWidth={1.5} />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Booking Confirmed!</h1>
                <p className="text-gray-500 text-sm mb-12 leading-relaxed">
                    Your appointment has been successfully scheduled. We've sent the confirmation details and a calendar invite to your email.
                </p>

                <div className="glass-card p-6 mb-12 text-left border-emerald-100 bg-emerald-50/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-medical-blue">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</div>
                            <div className="text-sm font-bold text-gray-900 italic">Tomorrow, Oct 24, 2023</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-medical-blue">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time</div>
                            <div className="text-sm font-bold text-gray-900 italic">10:30 AM - 11:00 AM</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link href="/dashboard/patient" className="btn-primary w-full py-4 text-sm font-bold shadow-xl shadow-medical-blue/20 flex items-center justify-center gap-2 group">
                        Go to My Dashboard
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/doctors" className="block text-medical-blue text-xs font-bold hover:underline">
                        Book another appointment
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-4">Need to make changes?</p>
                    <div className="flex justify-center gap-6">
                        <button className="text-[10px] font-bold text-gray-500 hover:text-gray-900">Reschedule</button>
                        <button className="text-[10px] font-bold text-gray-500 hover:text-gray-900">Cancel Booking</button>
                        <button className="text-[10px] font-bold text-gray-500 hover:text-gray-900">Contact Support</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
