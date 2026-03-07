"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    Activity,
    Flame,
    Droplets,
    Calendar,
    Video,
    ArrowRight,
    Search,
    ChevronRight,
    TrendingUp,
    Clock,
    LogOut,
    Bell
} from 'lucide-react'

export default function PatientDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, statsRes, profileRes] = await Promise.all([
                    fetch('/api/patient/bookings'),
                    fetch('/api/patient/dashboard/stats'),
                    fetch('/api/patient/profile')
                ])

                const [bookingsData, statsData, profileData] = await Promise.all([
                    bookingsRes.json(),
                    statsRes.json(),
                    profileRes.json()
                ])

                if (Array.isArray(bookingsData)) setBookings(bookingsData)
                setStats(statsData)
                setProfile(profileData)
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Sidebar Mock for Layout */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-8 z-50">
                <Link href="/" className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">HealthBook</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={<Activity size={18} />} label="Overview" href="/dashboard/patient" active />
                    <NavItem icon={<Search size={18} />} label="Find Doctors" href="/doctors" />
                    <NavItem icon={<Calendar size={18} />} label="My Bookings" href="/bookings" />
                    <NavItem icon={<Video size={18} />} label="Telehealth" href="/telehealth" />
                </nav>

                <div className="pt-8 border-t border-gray-50">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/login')
                        }}
                        className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-rose-500 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="lg:ml-64 p-6 md:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! </h1>
                        <p className="text-gray-500 text-sm font-medium">Your health summary and {stats?.upcoming_appointments || 0} upcoming appointments at a glance.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/bookings" className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 relative hover:border-medical-blue/30 transition-colors">
                            <Bell size={18} />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></div>
                        </Link>
                        <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-soft-cyan text-medical-blue font-bold flex items-center justify-center text-xs">
                                {profile?.full_name?.[0] || 'U'}
                            </div>
                            <span className="text-xs font-bold text-gray-900 italic">{profile?.full_name || 'Generic User'}</span>
                        </div>
                    </div>
                </header>

                {/* Health Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        icon={<Activity className="text-rose-500" />}
                        label="Heart Rate"
                        value={stats?.health_stats?.heart_rate || "72"}
                        unit="BPM"
                        trend="Normal"
                        color="bg-rose-50"
                    />
                    <StatCard
                        icon={<Flame className="text-orange-500" />}
                        label="Total Sessions"
                        value={stats?.total_appointments || "0"}
                        unit="COUNT"
                        trend="Total"
                        color="bg-orange-50"
                    />
                    <StatCard
                        icon={<Droplets className="text-medical-blue" />}
                        label="Hydration"
                        value={stats?.health_stats?.hydration || "80"}
                        unit="%"
                        trend="Good"
                        color="bg-blue-50"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Telehealth Promo */}
                        <div className="relative overflow-hidden rounded-3xl bg-medical-blue p-8 text-white shadow-xl shadow-medical-blue/20">
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                                <Video size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 max-w-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Telehealth is active</span>
                                </div>
                                <h2 className="text-2xl font-black mb-3">Need urgent help?</h2>
                                <p className="text-white/70 text-sm mb-6 leading-relaxed">Connect with a specialized GP in less than 5 minutes for a virtual consultation.</p>
                                <button className="bg-white text-medical-blue px-6 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                    Start Video Call
                                    <Video size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Sessions */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Upcoming Sessions</h3>
                                <Link href="/bookings" className="text-medical-blue text-xs font-bold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></Link>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-24 glass-card shimmer opacity-30"></div>)}
                                </div>
                            ) : bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((booking: any) => (
                                        <BookingListItem key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                                        <Calendar size={32} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">No upcoming visits</h4>
                                    <p className="text-gray-400 text-xs mb-6 px-12">Take control of your health. Schedule your next check-up today.</p>
                                    <Link href="/doctors" className="btn-secondary px-6 py-3 text-xs inline-flex items-center gap-2">
                                        Browse Specialists
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Sidebar: Medical History & Quick Actions */}
                    <div className="space-y-8">
                        <section className="glass-card p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp size={16} className="text-medical-blue" />
                                Health Insights
                            </h3>
                            <div className="space-y-6">
                                <InsightItem label="Daily Steps" value="8,432" target="10,000" percentage={84} color="bg-medical-blue" />
                                <InsightItem label="Sleep Quality" value="7h 20m" target="8h" percentage={92} color="bg-emerald-500" />
                                <InsightItem label="Water Intake" value="1.8L" target="2.5L" percentage={72} color="bg-cyan-400" />
                            </div>
                        </section>

                        <section className="glass-card p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-6">Medical Documents</h3>
                            <div className="space-y-4">
                                <DocItem name="Blood_Test_Results.pdf" date="Oct 12, 2023" />
                                <DocItem name="Prescription_Refill.pdf" date="Sep 28, 2023" />
                                <DocItem name="Vitals_Report.pdf" date="Sep 15, 2023" />
                            </div>
                            <button className="w-full mt-6 py-3 text-[10px] font-bold text-gray-400 border border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-widest">
                                + Upload Document
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

function NavItem({ icon, label, href = "#", active = false }: { icon: any, label: string, href?: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
        >
            {icon}
            {label}
        </Link>
    )
}

function StatCard({ icon, label, value, unit, trend, color }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-bl-[100px] opacity-20 -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">{icon}</div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'text-emerald-success bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                        {trend}
                    </span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</div>
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                    {value} <span className="text-xs text-gray-400 font-medium">{unit}</span>
                </div>
            </div>
        </div>
    )
}

function BookingListItem({ booking }: { booking: any }) {
    return (
        <div className="glass-card p-5 flex items-center justify-between group hover:border-medical-blue/30 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden">
                    <img src={booking.doctor?.image_url || "https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=100"} className="w-full h-full object-cover" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900">{booking.doctor?.profiles?.full_name}</div>
                    <div className="text-[10px] text-medical-blue font-bold uppercase tracking-wider">{booking.doctor?.specialty}</div>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="hidden md:block">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date & Time</div>
                    <div className="text-xs font-bold text-gray-700 italic flex items-center gap-1">
                        <Clock size={12} /> {booking.appointment_date} @ {booking.appointment_time}
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-success border border-emerald-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>
                    {booking.status}
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-medical-blue transition-colors group-hover:bg-medical-blue/5">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    )
}

function InsightItem({ label, value, target, percentage, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-900 italic">{value} / {target}</span>
            </div>
            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}

function DocItem({ name, date }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-medical-blue">📄</div>
                <div>
                    <div className="text-[11px] font-bold text-gray-700 group-hover:text-medical-blue transition-colors">{name}</div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-tighter font-medium">{date}</div>
                </div>
            </div>
            <ArrowRight size={12} className="text-gray-200 group-hover:text-medical-blue group-hover:translate-x-1 transition-all" />
        </div>
    )
}
