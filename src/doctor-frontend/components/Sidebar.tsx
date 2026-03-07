"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    Settings,
    UserCircle,
    ClipboardList,
    LogOut,
    Stethoscope,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

const MENU_ITEMS = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/doctor' },
    { label: 'Requests', icon: ClipboardList, href: '/dashboard/doctor/bookings' },
    { label: 'My Schedule', icon: CalendarDays, href: '/dashboard/doctor/schedule' },
    { label: 'Services', icon: Stethoscope, href: '/dashboard/doctor/services' },
    { label: 'Profile', icon: UserCircle, href: '/dashboard/doctor/profile' },
]

export default function DoctorSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/dashboard/doctor" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-medical-blue text-white flex items-center justify-center font-black">
                        M
                    </div>
                    <span className="font-bold text-gray-900">Dr. Dashboard</span>
                </Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 p-6 flex flex-col pt-20 md:pt-6 z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <Link href="/dashboard/doctor" className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center font-black text-xl shadow-md shadow-medical-blue/20">
                        M
                    </div>
                    <div>
                        <div className="font-black text-gray-900 text-lg leading-tight">Medica</div>
                        <div className="text-[10px] uppercase font-bold text-medical-blue tracking-widest">Provider Portal</div>
                    </div>
                </Link>

                <div className="flex-1 space-y-2">
                    {MENU_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Link>
                </div>
            </aside>
        </>
    )
}
